import { readFileSync } from 'fs';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { parse } from './csv';
import { itemRepo } from './wiring.js';
import { Item } from './items.js';
import _ from 'lodash';

const ENCODING = 'latin1';

export interface Args {
  file: string;
  // one of: regen, rulestats
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
      describe: 'the action to execute',
    },
  }).argv;

export default (): void => {
  const data = readFileSync(args.file, { encoding: ENCODING });
  switch (args.action) {
    case 'regen':
      regen(data);
      break;
    case 'rulestats':
      rulestats(data);
      break;
    default:
      console.error(
        `Unknown action: "${args.action}". Chose one of: { regen, rulestats }.`
      );
  }
};

function regen(data: string) {
  function key(it: Item): string {
    return `${it.date.utc()}:${it.description}:${it.amount}`;
  }

  const overrides = itemRepo.load();
  const items = _.keyBy(parse(data), (it) => key(it));

  const updated = [];
  overrides.forEach((o) => {
    const it = items[key(o)];
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

import rules from './rules';
interface RuleStat {
  category: string;
  rule: string;
  items: Item[];
  conflicts: string[];
}
function rulestats(data: string) {
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

  _.sortBy(Object.values(stats), 'category').forEach((s) =>
    console.log(
      `${_.padEnd(s.category, 10)} ${_.padEnd(s.rule, 30)} ${_.padStart(
        String(s.items.length),
        4
      )}${s.conflicts.length == 0 ? '' : '  !!!CONFLICT!!!'}`
    )
  );
}
