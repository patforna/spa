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
