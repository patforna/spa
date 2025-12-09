import { readFileSync } from 'fs';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { CategoriseCommand } from './commands/categorise.js';
import { ClusterCommand } from './commands/cluster.js';
import { DetailsCommand } from './commands/details.js';
import { Command } from './commands/index.js';
import { SummaryCommand } from './commands/summary.js';
import { InputParserFactory } from './parsers/index.js';
import { Transaction, expandSplits } from './transactions.js';
import { Wiring } from './wiring.js';
import { expandPaths } from './utils.js';

export default (): void => {
  const commands = [];
  const wiring = new Wiring();
  const rules = wiring.rules;
  const overrides = wiring.overrides;
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
          sortBy: {
            alias: 's',
            type: 'string',
            default: 'category',
            choices: ['amount', 'category'],
            describe: 'Sort by "category" or "amount".',
          },
        });
      },
      handler: (args) => {
        commands.push(
          new CategoriseCommand(rules, overrides, overridesRepo, categoriser),
          new SummaryCommand(args['sortBy'])
        );
      },
    })
    .command({
      command: 'details',
      describe: 'Show all transactions.',
      builder: (yargs) => {
        return yargs.options({
          sortBy: {
            alias: 's',
            type: 'string',
            default: 'category',
            choices: ['amount', 'category', 'date'],
            describe: 'Sort by field.',
          },
          category: {
            alias: 'c',
            type: 'string',
            describe: 'Only show transactions for given category',
          },
        });
      },
      handler: (args) => {
        commands.push(
          new CategoriseCommand(rules, overrides, overridesRepo, categoriser),
          new DetailsCommand(args['sortBy'], args['category'])
        );
      },
    })
    .command({
      command: 'cluster',
      describe: 'Cluster transactions',
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
          new CategoriseCommand(rules, overrides, overridesRepo, categoriser),
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
    .parseSync();

  run(args.inputs as string[], inputParserFactory, commands, overrides).catch(
    (error) => {
      console.error('Error:', error.message);
      process.exit(1);
    }
  );
};

export async function run(
  inputs: string[],
  inputParserFactory: InputParserFactory,
  commands: Command[],
  overrides: Transaction[] = []
) {
  const filePaths = await expandPaths(...inputs);
  console.log(
    `Processing ${filePaths.length} files from input patterns: ${inputs.join(', ')}\n` +
      `Files to process:\n${filePaths.map((file) => `  - ${file}`).join('\n')}`
  );

  const txs = [];
  for (const filePath of filePaths) {
    const content = readFileSync(filePath, 'utf8');
    const parser = inputParserFactory.createParser(content);
    txs.push(...(await parser.parse(content)));
  }

  expandSplits(txs, overrides);

  for (const command of commands) {
    await command.execute(txs);
  }
}
