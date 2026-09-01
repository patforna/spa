import { join } from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { DetailsCommand } from './commands/details.js';
import { ImportOverridesCommand } from './commands/importOverrides.js';
import { Command } from './commands/index.js';
import { SummaryCommand } from './commands/summary.js';
import { TxLoader } from './transactions.js';
import { DATA_DIR, Wiring } from './wiring.js';

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
  // What the chosen command will do, once we have a Wiring to do it with.
  // Deferred so that --help, --version and usage errors never touch the data
  // directory - a fresh clone has none until `cp -r examples data`.
  let run: ((wiring: Wiring) => Promise<void>) | undefined;

  // Shared option for commands that process transaction files
  const inputsOption = {
    alias: 'i',
    type: 'array' as const,
    describe: 'Input files, directories, or glob patterns.',
    demandOption: true,
  };

  const args = yargs(hideBin(process.argv))
    .scriptName('spa')
    .usage('$0 <command> -i <inputs...>')
    .example('$0 summary -i file.csv', 'Single file')
    .example('$0 summary -i a.csv b.csv', 'Multiple files')
    .example('$0 summary -i samples/', 'Directory')
    .example('$0 summary -i **/*.csv', 'Glob pattern')
    .command({
      command: 'summary',
      describe: 'Summarises transactions for the year.',
      builder: (yargs) => {
        return yargs.options({
          inputs: inputsOption,
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
        run = (wiring) =>
          wiring.app.run(args['inputs'] as string[], [
            wiring.categoriseCommand,
            new SummaryCommand(args['sortBy'], wiring.output),
          ]);
      },
    })
    .command({
      command: 'details',
      describe: 'Show all transactions.',
      builder: (yargs) => {
        return yargs.options({
          inputs: inputsOption,
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
        run = (wiring) =>
          wiring.app.run(args['inputs'] as string[], [
            wiring.categoriseCommand,
            new DetailsCommand(args['sortBy'], args['category'], wiring.output),
          ]);
      },
    })
    .command({
      command: 'cluster',
      describe: 'Cluster transactions',
      builder: (yargs) => {
        return yargs.options({
          inputs: inputsOption,
          n: {
            type: 'number',
            describe:
              'The max levensthein distance to qualify for cluster membership.',
            default: 10,
          },
        });
      },
      handler: (args) => {
        run = (wiring) =>
          wiring.app.run(args['inputs'] as string[], [
            wiring.categoriseCommand,
            wiring.clusterCommand,
          ]);
      },
    })
    .command({
      command: 'import-overrides <file>',
      describe:
        'Merge overrides from JSON into profile (for Claude Code automation). ' +
        'Format: [{date, amount, category, comment?}, ...]',
      builder: (yargs) => {
        return yargs.positional('file', {
          type: 'string',
          describe: 'JSON file with overrides to import',
        });
      },
      handler: (args) => {
        run = async (wiring) => {
          new ImportOverridesCommand(
            args.file as string,
            wiring.overridesRepo,
            wiring.overrides,
            wiring.output
          ).execute();
        };
      },
    })
    .options({
      'non-interactive': {
        type: 'boolean',
        default: false,
        describe:
          'Output uncategorised txs as JSON instead of prompting. Mainly used for automation.',
      },
      profile: {
        alias: 'p',
        type: 'string',
        default: 'common',
        describe: 'Profile name (uses <data-dir>/overrides-<profile>.json).',
      },
    })
    .demandCommand(1, 'Specify a command. Run `spa --help` to see them all.')
    .strict()
    .parseSync();

  if (!run) return;

  let wiring: Wiring;
  try {
    wiring = new Wiring({
      nonInteractive: args['non-interactive'],
      overridesPath: join(DATA_DIR, `overrides-${args.profile}.json`),
    });
  } catch (error) {
    fail(error);
  }

  run(wiring).catch(fail);
};

/** Reports a startup or run failure without a stack trace, then exits. */
function fail(error: unknown): never {
  const err = error as NodeJS.ErrnoException;
  if (err?.code === 'ENOENT') {
    console.error(
      `Error: cannot read ${err.path}\n` +
        'Create a data directory with `cp -r examples data`, or point ' +
        'SPA_DATA_DIR at your own.'
    );
  } else {
    console.error('Error:', err?.message ?? error);
  }
  process.exit(1);
}
