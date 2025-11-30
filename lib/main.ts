import { readFileSync } from 'fs';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { CategoriseCommand } from './commands/categorise.js';
import { ClusterCommand } from './commands/cluster.js';
import { CategoryCommand, SortBy } from './commands/details.js';
import { Command } from './commands/index.js';
import { JsonCommand } from './commands/json.js';
import { TableCommand } from './commands/table.js';
import { InputParserFactory } from './parsers/index.js';
import { Wiring } from './wiring.js';
import { expandPaths } from './utils.js';

interface Arguments {
  inputs: string[];
  json?: boolean;
  sortBy?: SortBy;
  category?: string;
  n?: number;
}

export default (): void => {
  const commands = [];
  const wiring = new Wiring();
  const rulesRepo = wiring.rulesRepo;
  const overridesRepo = wiring.overridesRepo;
  const categoriser = wiring.categoriser;
  const inputParserFactory = wiring.inputParserFactory;

  const args = yargs(hideBin(process.argv))
    .scriptName('money')
    .usage(
      `Usage: $0 <command> -i <inputs...>

Examples:
  $0 summary -i file1.csv
  $0 summary -i file1.csv file2.csv
  $0 summary -i dir
  $0 summary -i **/*.csv`
    )
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
          sortBy: {
            alias: 's',
            type: 'string',
            default: 'category',
            choices: ['category', 'amount'],
            describe: 'Sort by "category" or "amount". Default: "category".',
          },
        });
      },
      handler: (args) => {
        commands.push(
          new CategoriseCommand(rulesRepo, overridesRepo, categoriser),
          args['json'] ? new JsonCommand() : new TableCommand(args['sortBy'])
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
                'Sort by ["amount", "card", "category", "comment", "date", "description"]. Default: "date".',
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
          new CategoriseCommand(rulesRepo, overridesRepo, categoriser),
          new CategoryCommand(args['sortBy'], args['category'])
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
        commands.push(
          new CategoriseCommand(rulesRepo, overridesRepo, categoriser),
          new ClusterCommand()
        );
      },
    })
    .options({
      inputs: {
        alias: 'i',
        type: 'array',
        describe:
          'Input files, directories, or glob patterns. Can be specified multiple times or space-separated.',
        demandOption: true,
      },
    })
    .parseSync() as Arguments;

  Promise.all([run(args.inputs, inputParserFactory, commands)]);
};

export async function run(
  inputs: string[],
  inputParserFactory: InputParserFactory,
  commands: Command[]
) {
  const filePaths = await expandPaths(...inputs);
  console.log(
    `Processing ${filePaths.length} files from input patterns: ${inputs.join(', ')}\n` +
      `Files to process:\n${filePaths.map((file) => `  - ${file}`).join('\n')}`
  );

  const items = [];
  for (const filePath of filePaths) {
    const content = readFileSync(filePath, 'utf8');
    const parser = inputParserFactory.createParser(content);
    items.push(...(await parser.parse(content)));
  }

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
