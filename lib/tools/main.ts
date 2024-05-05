import { readFileSync } from 'fs';
import _ from 'lodash';
import currency from 'currency.js';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { Categoriser, IGNORE, NO_CATEGORY } from '../categoriser.js';
import { parse, parseItems } from '../csv.js';
import { asString, Item, shortDescription } from '../items.js';
import { overridesRepo } from '../wiring.js';

const ENCODING = 'latin1';
const GBP_CHF = 1.15; // adjust if necessary before running bin/tools wise ...

export default (): void => {
  yargs(hideBin(process.argv))
    .scriptName('tools')
    .usage('Usage: $0 <command>')
    .command({
      command: 'wise',
      describe: 'Parses wise transactions.',
      builder: (yargs) => {
        return yargs.options({
          file: {
            alias: 'f',
            type: 'string',
            describe: 'The csv file containing the wise transactions.',
            demandOption: true,
          },
        });
      },
      handler: (args) => {
        const data = readFileSync(args['file'], { encoding: ENCODING });
        parseWise(data);
      },
    })
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
        const data = readFileSync(args['file'], { encoding: ENCODING });
        regen(data);
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
        const data = readFileSync(args['file'], { encoding: ENCODING });
        removeUnnecessaryOverrides(data);
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
        const data = readFileSync(args['file'], { encoding: ENCODING });
        ruleStats(data);
      },
    })
    .command({
      command: 'overrides_stats',
      describe: 'Show overrides stats',
      handler: () => {
        overridesStats();
      },
    })
    .parseSync();
};

function key(it: Item): string {
  return `${it.date.utc()}:${it.description}:${it.amount}`;
}

export interface WiseItem {
  id: string;
  status: string;
  direction: string;
  createdOn: moment.Moment;
  sourceAmountAfterFees: number;
  sourceCurrency: string;
  targetName: string;
}

function parseWise(data: string) {
  const parsed = parse(data)
    .map((x) => x as WiseItem)
    .filter(
      (x) =>
        x.direction == 'OUT' &&
        x.status == 'COMPLETED' &&
        x.sourceAmountAfterFees > 0
    );

  const additionalItems = parsed.map((item) => {
    return {
      date: item.createdOn,
      amount: -convertGBPToCHF(item.sourceAmountAfterFees),
      description: `${item.targetName} | #wise`,
    };
  });

  console.log(JSON.stringify(_.sortBy(additionalItems, 'date'), null, 2));
}

function convertGBPToCHF(amountInGBP: number) {
  return currency(amountInGBP).multiply(GBP_CHF);
}

function regen(data: string) {
  const overrides = overridesRepo.load();
  const itemsByKey = _.keyBy(parseItems(data), (it) => key(it));

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

function removeUnnecessaryOverrides(data: string) {
  const categoriser = new Categoriser([]);
  let items = parseItems(data);
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
import moment from 'moment';

interface RuleStat {
  category: string;
  rule: string;
  items: Item[];
  conflicts: string[];
}

function ruleStats(data: string) {
  const items = parseItems(data);
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
  const overrides = overridesRepo.load();
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
