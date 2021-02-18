import { readFileSync } from 'fs';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { Args, Command, createCommands } from './commands/index';
import { parse } from './csv';

const ENCODING = 'latin1';

const args: Args = yargs(hideBin(process.argv))
  .usage('Usage: $0 -f <file>')
  .options({
    file: {
      alias: 'f',
      type: 'string',
      describe: 'the csv file to process',
      demandOption: true,
    },
    category: {
      alias: 'c',
      type: 'string',
      describe: 'display transactions for given category',
    },
    json: {
      alias: 'j',
      type: 'boolean',
      describe: 'display result in json instead of table format',
    },
  }).argv;

export default (): void => {
  const data = readFileSync(args.file, { encoding: ENCODING });
  // regen(data);
  const commands = createCommands(args);
  Promise.all([run(data, commands)]);
};

export async function run(data: string, commands: Command[]) {
  let items = parse(data);
  for (const command of commands) {
    await command.execute(items);
  }
}

// import { itemRepo } from './wiring.js';
// import { Item } from './items.js';
// import _ from 'lodash';
// function regen(data: string) {
//   function key(it: Item): string {
//     return `${it.date.utc()}:${it.description}:${it.amount}`;
//   }

//   const overrides = itemRepo.load();
//   const items = _.keyBy(parse(data), (it) => key(it));

//   const updated = [];
//   overrides.forEach((o) => {
//     const it = items[key(o)];
//     if (it) {
//       it.category = o.category;
//       it.comment = o.comment;
//       updated.push(it);
//     } else {
//       updated.push(o);
//     }
//   });

//   itemRepo.saveAll(updated);
// }
