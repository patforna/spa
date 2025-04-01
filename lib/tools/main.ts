import { readFileSync } from 'fs';
import _ from 'lodash';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { Categoriser, IGNORE, NO_CATEGORY } from '../categoriser.js';
import { Item, ItemRepo, asString, shortDescription } from '../items.js';
import { InputParserFactory } from '../parsers/index.js';
import { Wiring } from '../wiring.js';

export default (): void => {
  const commands: (() => Promise<void>)[] = [];
  const wiring = new Wiring();
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
            data,
            overridesRepo,
            inputParserFactory
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
          await ruleStats(data, inputParserFactory);
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

function key(it: Item): string {
  return `${it.date.utc()}:${it.description}:${it.amount}`;
}

async function regen(
  data: string,
  overridesRepo: ItemRepo,
  inputParserFactory: InputParserFactory
) {
  const overrides = overridesRepo.load();
  const itemsByKey = _.keyBy(
    await inputParserFactory.createParser(data).parse(data),
    (it) => key(it)
  );

  const updated = [];
  overrides.forEach((o) => {
    const it = itemsByKey[key(o)];
    if (it) {
      it.category = o.category;
      it.comment = o.comment;
      updated.push(it);
    } else {
      updated.push(o);
    }
  });

  overridesRepo.saveAll(updated);
}

async function removeUnnecessaryOverrides(
  data: string,
  overridesRepo: ItemRepo,
  inputParserFactory: InputParserFactory
) {
  const categoriser = new Categoriser([]);
  let items = await inputParserFactory.createParser(data).parse(data);
  items.forEach((item) => categoriser.categorise(item));
  items = items.filter((item) => item.category !== NO_CATEGORY);

  const overrides = overridesRepo.load();
  const itemsByKey = _.keyBy(items, (it) => key(it));

  const updated = [];
  overrides.forEach((o) => {
    const item = itemsByKey[key(o)];
    if (!item || o.category === IGNORE || o.comment) {
      updated.push(o);
    } else if (item.category !== o.category) {
      console.log(
        `Warning: removing override with different category: ${shortDescription(
          item
        )}; C: ${item.category}; O: ${o.category}`
      );
    }
  });

  overridesRepo.saveAll(updated);

  console.log(
    `Removed ${overrides.length - updated.length} unnecessary overrides.`
  );
}

import rules from '../rules.js';

interface RuleStat {
  category: string;
  rule: string;
  items: Item[];
  conflicts: string[];
}

async function ruleStats(data: string, inputParserFactory: InputParserFactory) {
  const items = await inputParserFactory.createParser(data).parse(data);
  console.log('items length: ' + items.length);
  const stats: { [k: string]: RuleStat } = {};

  function key([cat, re]) {
    return `${cat}:${re.source}`;
  }

  function categoriseUsingRules(item: Item): void {
    Object.entries(rules).forEach((rule) => {
      const [cat, res] = rule;
      res.forEach((re: RegExp) => {
        const k = key([cat, re]);
        if (re.test(item.description)) {
          const ruleStat: RuleStat = _.defaultTo(stats[k], {
            category: cat,
            rule: re.source,
            items: [],
            conflicts: [],
          });
          if (item.category !== undefined && item.category != cat)
            ruleStat.conflicts.push(item.category);
          else {
            item.category = cat;
            ruleStat.items.push(item);
          }

          stats[k] = ruleStat;
        }
      });
    });
  }

  items.forEach(categoriseUsingRules);

  _.sortBy(Object.values(stats), 'category').forEach((s) => {
    console.log('------------------------------------------------------------');
    console.log(
      `${_.padEnd(s.category, 15)} ${_.padEnd(s.rule, 40)} ${_.padStart(
        String(s.items.length),
        3,
        '0'
      )}${s.conflicts.length == 0 ? '' : '  !!!CONFLICT!!!'}`
    );
    s.items.forEach((it) => console.log(asString(it)));
  });
}

function overridesStats(overrides: Item[]) {
  const map: Record<string, number> = {};
  overrides.forEach((o) => {
    const key = shortDescription(o);
    if (key in map) map[key] = map[key] + 1;
    else map[key] = 1;
  });

  const result = _.filter(Object.entries(map), ([_, v]) => v > 1);

  _.orderBy(result, [([_, v]) => v], ['desc']).forEach(([k, v]) =>
    console.log(`${_.padStart(_.toString(v), 3)}: ${k}`)
  );
}
