import { readFileSync } from 'fs';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { Args, Command, createCommands } from './commands/index';
import { parse } from './csv';

const ENCODING = 'latin1';

export default (): void => {
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
      sortBy: {
        alias: 's',
        type: 'string',
        default: 'date',
        describe:
          'sort by ["date", "amount"] when using -category (default: "date")',
      },
      json: {
        alias: 'j',
        type: 'boolean',
        describe: 'display result in json instead of table format',
      },
    })
    .parseSync();

  const data = readFileSync(args.file, { encoding: ENCODING });
  const commands = createCommands(args);
  Promise.all([run(data, commands)]);
};

export async function run(data: string, commands: Command[]) {
  let items = parse(data);
  for (const command of commands) {
    await command.execute(items);
  }
}
