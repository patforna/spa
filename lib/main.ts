import { readFileSync } from 'fs';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { CategoriseCommand } from './commands/categorise.js';
import { ClusterCommand } from './commands/cluster.js';
import {
  CategoryCommand as DetailsCommand,
  SortBy,
} from './commands/details.js';
import { Command } from './commands/index.js';
import { JsonCommand } from './commands/json.js';
import { TableCommand } from './commands/table.js';

import { parse } from './csv.js';

const ENCODING = 'latin1';

export default (): void => {
  const commands = [];

  const args = yargs(hideBin(process.argv))
    .scriptName('money')
    .usage('Usage: $0 -f <file>')
    .command({
      command: 'summary',
      describe: 'Summarises transactions for the year.',
      builder: (yargs) => {
        return yargs.options({
          json: {
            alias: 'j',
            type: 'boolean',
            default: false,
            describe: 'Display result in json instead of table format.',
          },
        });
      },
      handler: (args) => {
        commands.push(
          new CategoriseCommand(true),
          args['json'] ? new JsonCommand() : new TableCommand()
        );
      },
    })
    .command({
      command: 'details',
      describe: 'Show all transactions.',
      builder: (yargs) => {
        return yargs
          .options({
            sortBy: {
              alias: 's',
              type: 'string',
              default: 'date',
              describe:
                'Sort by ["amount", "card", "category", "comment", "date", "description]. Default: "date".',
            },
            category: {
              alias: 'c',
              type: 'string',
              describe: 'Only show transactions for given category',
            },
          })
          .coerce('sortBy', parseSortBy);
      },
      handler: (args) => {
        commands.push(
          new CategoriseCommand(),
          new DetailsCommand(args['sortBy'], args['category'])
        );
      },
    })
    .command({
      command: 'cluster',
      describe: 'Cluster items',
      builder: (yargs) => {
        return yargs.options({
          n: {
            type: 'number',
            describe:
              'The max levensthein distance to qualify for cluster membership.',
            default: 10,
          },
        });
      },
      handler: () => {
        commands.push(new CategoriseCommand(), new ClusterCommand());
      },
    })
    .options({
      file: {
        alias: 'f',
        type: 'string',
        describe: 'The csv file containing the transactions.',
        demandOption: true,
      },
    })
    .parseSync();

  const data = readFileSync(args.file, { encoding: ENCODING });
  Promise.all([run(data, commands)]);
};

export async function run(data: string, commands: Command[]) {
  let items = parse(data);
  for (const command of commands) {
    await command.execute(items);
  }
}

function parseSortBy(s: string): SortBy {
  switch (s) {
    case 'amount':
      return SortBy.Amount;
    case 'card':
      return SortBy.Card;
    case 'category':
      return SortBy.Category;
    case 'comment':
      return SortBy.Comment;
    case 'date':
      return SortBy.Date;
    case 'description':
      return SortBy.Description;
    default:
      throw new Error(`Unknown value for -s: "${s}". See usage.`);
  }
}
