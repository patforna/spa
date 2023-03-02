import { readFileSync } from 'fs';
import _ from 'lodash';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { Categoriser, IGNORE, NO_CATEGORY } from './categoriser.js';
import { parse } from './csv.js';
import { asString, Item, shortDescription } from './items.js';
import { itemRepo } from './wiring.js';

const ENCODING = 'latin1';

export interface Args {
  file: string;
  action: string;
}

const args: Args = yargs(hideBin(process.argv))
  .usage('Usage: $0 -f <file>')
  .options({
    file: {
      alias: 'f',
      type: 'string',
      describe: 'the csv file to process',
      demandOption: true,
    },
    action: {
      alias: 'a',
      type: 'string',
      describe:
        'the action to execute (one of: regen, remove_unnecessary_overrides, rule_stats, overrides_stats)',
    },
  })
  .parseSync();

export default (): void => {
  const data = readFileSync(args.file, { encoding: ENCODING });
  switch (args.action) {
    case 'regen':
      regen(data);
      break;
    case 'remove_unnecessary_overrides':
      removeUnnecessaryOverrides(data);
      break;
    case 'rules_tats':
      ruleStats(data);
      break;
    case 'overrides_stats':
      overridesStats();
      break;
    default:
      console.error(`Unknown action: "${args.action}". See usage.`);
  }
};

function key(it: Item): string {
  return `${it.date.utc()}:${it.description}:${it.amount}`;
}

function regen(data: string) {
  const overrides = itemRepo.load();
  const itemsByKey = _.keyBy(parse(data), (it) => key(it));

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

  itemRepo.saveAll(updated);
}

function removeUnnecessaryOverrides(data: string) {
  const categoriser = new Categoriser([]);
  let items = parse(data);
  items.forEach((item) => categoriser.categorise(item));
  items = items.filter((item) => item.category !== NO_CATEGORY);

  const overrides = itemRepo.load();
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

  itemRepo.saveAll(updated);

  console.log(
    `Removed ${overrides.length - updated.length} unnecessary overrides.`
  );
}

import rules from './rules.js';

interface RuleStat {
  category: string;
  rule: string;
  items: Item[];
  conflicts: string[];
}

function ruleStats(data: string) {
  const items = parse(data);
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
          let ruleStat: RuleStat = _.defaultTo(stats[k], {
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

function overridesStats() {
  const overrides = itemRepo.load();
  const map = {};
  overrides.forEach((o) => {
    const key = shortDescription(o);
    if (key in map) map[key] = map[key] + 1;
    else map[key] = 1;
  });

  const result = _.filter(Object.entries(map), ([_, v]) => v > 1);

  _.orderBy(result, [([_, v]) => v], ['desc']).forEach(([k, v]) =>
    console.log(`${_.padStart(_.toString(v), 3)}: ${k}`)
  );

  // fancier (but slower) version
  // compute levensthein distance for every item in cluster list and o
  // if levensthein distance is < x then increment
  // else add item desc to cluster list
}
