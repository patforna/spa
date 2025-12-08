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
} from '../transactions.js';
import { InputParserFactory } from '../parsers/index.js';
import { Rules } from '../rules.js';
import { Wiring } from '../wiring.js';

export default (): void => {
  const commands: (() => Promise<void>)[] = [];
  const wiring = new Wiring();
  const rules = wiring.rulesRepo.load();
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
          await regen(data, overridesRepo, inputParserFactory);
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
    .command({
      command: 'overrides_stats',
      describe: 'Show overrides stats',
      handler: () => {
        commands.push(async (): Promise<void> => {
          overridesStats(overridesRepo.load());
        });
      },
    })
    .parse();

  Promise.all(commands.map((f) => f()));
};

function key(tx: Transaction): string {
  return `${tx.date.utc()}:${tx.description}:${tx.amount}`;
}

async function regen(
  data: string,
  overridesRepo: OverridesRepo,
  inputParserFactory: InputParserFactory
) {
  const overrides = overridesRepo.load();
  const txsByKey = _.keyBy(
    await inputParserFactory.createParser(data).parse(data),
    (tx) => key(tx)
  );

  const updated = [];
  overrides.forEach((o) => {
    const tx = txsByKey[key(o)];
    if (tx) {
      tx.category = o.category;
      tx.comment = o.comment;
      updated.push(tx);
    } else {
      updated.push(o);
    }
  });

  overridesRepo.saveAll(updated);
}

async function removeUnnecessaryOverrides(
  rules: Rules,
  overridesRepo: OverridesRepo,
  inputParserFactory: InputParserFactory,
  data: string
) {
  const categoriser = new Categoriser(rules, []);
  let txs = await inputParserFactory.createParser(data).parse(data);
  txs.forEach((tx) => categoriser.categorise(tx));
  txs = txs.filter((tx) => tx.category !== NO_CATEGORY);

  const overrides = overridesRepo.load();
  const txsByKey = _.keyBy(txs, (tx) => key(tx));

  const updated = [];
  overrides.forEach((o) => {
    const tx = txsByKey[key(o)];
    if (!tx || o.category === IGNORE || o.comment) {
      updated.push(o);
    } else if (tx.category !== o.category) {
      console.log(
        `Warning: removing override with different category: ${shortDescription(
          tx
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

function overridesStats(overrides: Transaction[]) {
  const map: Record<string, number> = {};
  overrides.forEach((o) => {
    const k = shortDescription(o);
    if (k in map) map[k] = map[k] + 1;
    else map[k] = 1;
  });

  const result = _.filter(Object.entries(map), ([_, v]) => v > 1);

  _.orderBy(result, [([_, v]) => v], ['desc']).forEach(([k, v]) =>
    console.log(`${_.padStart(_.toString(v), 3)}: ${k}`)
  );
}
