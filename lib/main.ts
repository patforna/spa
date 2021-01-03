import { readFileSync } from 'fs';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { Args, createCommands } from './commands/index';
import { createSummaryFromCSV } from './summary.js';
import { categoriser } from './wiring.js';

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
  Promise.all([run(args)]);
};

async function run(args: Args) {
  const data = readFileSync(args.file, { encoding: ENCODING });
  const summary = createSummaryFromCSV(data, categoriser);
  const commands = createCommands(args);

  for (const command of commands) {
    await command.execute(summary);
  }
}
