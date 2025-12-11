import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { DetailsCommand } from './commands/details.js';
import { Command } from './commands/index.js';
import { SummaryCommand } from './commands/summary.js';
import { TxLoader } from './transactions.js';
import { Wiring } from './wiring.js';

export class App {
  constructor(private readonly txLoader: TxLoader) {}

  async run(inputs: string[], commands: Command[]): Promise<void> {
    const txs = await this.txLoader.load(inputs);

    for (const command of commands) {
      await command.execute(txs);
    }
  }
}

export default (): void => {
  const commands = [];
  const wiring = new Wiring();
  const app = wiring.app;
  const output = wiring.output;
  const categoriseCommand = wiring.categoriseCommand;
  const clusterCommand = wiring.clusterCommand;

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
          categoriseCommand,
          new SummaryCommand(args['sortBy'], output)
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
          categoriseCommand,
          new DetailsCommand(args['sortBy'], args['category'], output)
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
        commands.push(categoriseCommand, clusterCommand);
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

  app.run(args.inputs as string[], commands).catch((error) => {
    console.error('Error:', error.message);
    process.exit(1);
  });
};
