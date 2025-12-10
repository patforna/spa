import { readFileSync } from 'fs';
import _ from 'lodash';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { Categoriser, IGNORE, NO_CATEGORY } from '../categoriser.js';
import {
  Transaction,
  OverridesRepo,
  asString,
  shortDescription,
  Override,
} from '../transactions.js';
import { InputParserFactory } from '../parsers/index.js';
import { Rules } from '../rules.js';
import { Wiring } from '../wiring.js';

export default (): void => {
  const commands: (() => Promise<void>)[] = [];
  const wiring = new Wiring();
  const rules = wiring.rules;
  const overrides = wiring.overrides;
  const overridesRepo = wiring.overridesRepo;
  const inputParserFactory = wiring.inputParserFactory;

  yargs(hideBin(process.argv))
    .scriptName('tools')
    .usage('Usage: $0 <command>')
    .command({
      command: 'regen',
      describe: 'Regenerate overrides files.',
      builder: (yargs) => {
        return yargs.options({
          file: {
            alias: 'f',
            type: 'string',
            describe: 'The csv file containing the transactions.',
            demandOption: true,
          },
        });
      },
      handler: (args) => {
        commands.push(async (): Promise<void> => {
          const data = readFileSync(args['file'], 'utf8');
          await regen(data, overridesRepo, overrides, inputParserFactory);
        });
      },
    })
    .command({
      command: 'remove_unnecessary_overrides',
      describe: 'Removes unnecessary overrides.',
      builder: (yargs) => {
        return yargs.options({
          file: {
            alias: 'f',
            type: 'string',
            describe: 'The csv file containing the transactions.',
            demandOption: true,
          },
        });
      },
      handler: (args) => {
        commands.push(async (): Promise<void> => {
          const data = readFileSync(args['file'], 'utf8');
          await removeUnnecessaryOverrides(
            rules,
            overridesRepo,
            overrides,
            inputParserFactory,
            data
          );
        });
      },
    })
    .command({
      command: 'rule_stats',
      describe: 'Show rule stats',
      builder: (yargs) => {
        return yargs.options({
          file: {
            alias: 'f',
            type: 'string',
            describe: 'The csv file containing the transactions.',
            demandOption: true,
          },
        });
      },
      handler: (args) => {
        commands.push(async (): Promise<void> => {
          const data = readFileSync(args['file'], 'utf8');
          await ruleStats(rules, inputParserFactory, data);
        });
      },
    })
    .parse();

  Promise.all(commands.map((f) => f()));
};

function key(tx: Transaction | Override): string {
  return `${tx.date.utc()}:${tx.amount}`;
}

async function regen(
  data: string,
  overridesRepo: OverridesRepo,
  overrides: Override[],
  inputParserFactory: InputParserFactory
) {
  const txsByKey = _.keyBy(
    await inputParserFactory.createParser(data).parse(data),
    (tx) => key(tx)
  );

  const updated = [];
  overrides.forEach((o) => {
    const tx = txsByKey[key(o)];
    if (tx) {
      // Create a new Override object preserving original properties but updating category/comment
      const newOverride: Override = {
        ...o,
        category: tx.category,
        comment: tx.comment,
      };
      updated.push(newOverride);
    } else {
      updated.push(o);
    }
  });

  overridesRepo.saveAll(updated);
}

async function removeUnnecessaryOverrides(
  rules: Rules,
  overridesRepo: OverridesRepo,
  overrides: Override[],
  inputParserFactory: InputParserFactory,
  data: string
) {
  const categoriser = new Categoriser(rules, []);
  let txs = await inputParserFactory.createParser(data).parse(data);
  txs.forEach((tx) => categoriser.categorise(tx));
  txs = txs.filter((tx) => tx.category !== NO_CATEGORY);

  const txsByKey = _.keyBy(txs, (tx) => key(tx));

  const updated = [];
  overrides.forEach((o) => {
    const tx = txsByKey[key(o)];
    if (!tx || o.category === IGNORE || o.comment) {
      updated.push(o);
    } else if (tx.category !== o.category) {
      console.log(
        `Warning: removing override with different category: ${shortDescription(
          tx.description
        )}; C: ${tx.category}; O: ${o.category}`
      );
    }
  });

  overridesRepo.saveAll(updated);

  console.log(
    `Removed ${overrides.length - updated.length} unnecessary overrides.`
  );
}

interface RuleStat {
  category: string;
  rule: string;
  txs: Transaction[];
  conflicts: string[];
}

async function ruleStats(
  rules: Rules,
  inputParserFactory: InputParserFactory,
  data: string
) {
  const txs = await inputParserFactory.createParser(data).parse(data);
  console.log('txs length: ' + txs.length);
  const stats: { [k: string]: RuleStat } = {};

  function ruleKey([cat, re]) {
    return `${cat}:${re.source}`;
  }

  function categoriseUsingRules(tx: Transaction): void {
    Object.entries(rules).forEach((rule) => {
      const [cat, res] = rule;
      res.forEach((re: RegExp) => {
        const k = ruleKey([cat, re]);
        if (re.test(tx.description)) {
          const ruleStat: RuleStat = _.defaultTo(stats[k], {
            category: cat,
            rule: re.source,
            txs: [],
            conflicts: [],
          });
          if (tx.category !== undefined && tx.category != cat)
            ruleStat.conflicts.push(tx.category);
          else {
            tx.category = cat;
            ruleStat.txs.push(tx);
          }

          stats[k] = ruleStat;
        }
      });
    });
  }

  txs.forEach(categoriseUsingRules);

  _.sortBy(Object.values(stats), 'category').forEach((s) => {
    console.log('------------------------------------------------------------');
    console.log(
      `${_.padEnd(s.category, 15)} ${_.padEnd(s.rule, 40)} ${_.padStart(
        String(s.txs.length),
        3,
        '0'
      )}${s.conflicts.length == 0 ? '' : '  !!!CONFLICT!!!'}`
    );
    s.txs.forEach((tx) => console.log(asString(tx)));
  });
}
