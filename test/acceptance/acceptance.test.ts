import * as fs from 'fs';
import moment from 'moment-timezone';
import * as os from 'os';
import * as path from 'path';
import { Categoriser } from '../../lib/categoriser.js';
import { CategoriseCommand } from '../../lib/commands/categorise.js';
import { Command } from '../../lib/commands/index.js';
import { FxRateService } from '../../lib/fxRates.js';
import { Transaction, OverridesRepo } from '../../lib/transactions.js';
import { run } from '../../lib/main.js';
import { InputParserFactory } from '../../lib/parsers/index.js';
import { Rules, RulesRepo } from '../../lib/rules.js';
import { Summary } from '../../lib/summary.js';

const dataDir = path.join(process.cwd(), 'test', 'acceptance', 'data');

function createTempFile(content: string): string {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'money-test-'));
  const filePath = path.join(tempDir, 'test.csv');
  fs.writeFileSync(filePath, content, 'utf8');
  return filePath;
}

class CaptureTxsCommand implements Command {
  summary: Summary;

  async execute(txs: Transaction[]): Promise<void> {
    this.summary = new Summary(txs);
  }
}

const fakeOverridesRepo = {
  load(): Transaction[] {
    return [];
  },
  saveAll(): void {},
} as unknown as OverridesRepo;

// Fake rules repo for testing
const fakeRulesRepo = {
  load(): Rules {
    return {
      activities: [new RegExp('#activities', 'i')],
      shopping: [new RegExp('#shopping', 'i')],
      ignore: [new RegExp('#ignore', 'i')],
      other: [
        new RegExp('^(?!.*#activities)(?!.*#shopping)(?!.*#ignore).*$', 'i'),
      ], // everything else
    };
  },
} as unknown as RulesRepo;

// Fake FX rate service for testing
const fakeFxRateService = {
  convert: async (from: string, to: string, amount: number) => {
    if (from === 'GBP' && to === 'CHF') return amount * 1.0; // Example GBP to CHF rate
    if (from === 'EUR' && to === 'CHF') return amount * 1.0; // Example EUR to CHF rate
    if (from === 'USD' && to === 'CHF') return amount * 1.0; // Example USD to CHF rate
    throw new Error(`Unsupported currency conversion from ${from} to ${to}`);
  },
} as unknown as FxRateService;

describe('Acceptance tests', () => {
  const categoriser = new Categoriser(
    fakeRulesRepo.load(),
    fakeOverridesRepo.load()
  );
  const captureCommand = new CaptureTxsCommand();
  const inputParserFactory = new InputParserFactory(fakeFxRateService);
  const commands = [
    new CategoriseCommand(fakeRulesRepo, fakeOverridesRepo, categoriser),
    captureCommand,
  ];

  test('should process Wise transactions', async () => {
    await run(
      [path.join(dataDir, 'wise-transactions.csv')],
      inputParserFactory,
      commands
    );

    const { amount, transactions } = captureCommand.summary.total();
    expect(transactions).toBe(6);
    expect(amount).toBe(-4);

    const shopping = captureCommand.summary.totalForCategory('shopping');
    expect(shopping.transactions).toBe(3);
    expect(shopping.amount).toBe(-1);

    const other = captureCommand.summary.totalForCategory('other');
    expect(other.transactions).toBe(3);
    expect(other.amount).toBe(-3);
  });

  test('should process ZKB transactions', async () => {
    await run(
      [path.join(dataDir, 'zkb-transactions.csv')],
      inputParserFactory,
      commands
    );

    const { amount, transactions } = captureCommand.summary.total();
    expect(transactions).toBe(5);
    expect(amount).toBe(-3);

    const shopping = captureCommand.summary.totalForCategory('shopping');
    expect(shopping.transactions).toBe(3);
    expect(shopping.amount).toBe(-1);

    const activities = captureCommand.summary.totalForCategory('activities');
    expect(activities.transactions).toBe(1);
    expect(activities.amount).toBe(-1);

    const other = captureCommand.summary.totalForCategory('other');
    expect(other.transactions).toBe(1);
    expect(other.amount).toBe(-1);
  });

  test('should process Viseca transactions', async () => {
    await run(
      [path.join(dataDir, 'viseca-transactions.csv')],
      inputParserFactory,
      commands
    );

    const { amount, transactions } = captureCommand.summary.total();
    expect(transactions).toBe(6);
    expect(amount).toBe(-4);
  });

  test('should process Revolut transactions', async () => {
    await run(
      [path.join(dataDir, 'revolut-transactions.csv')],
      inputParserFactory,
      commands
    );

    const { amount, transactions } = captureCommand.summary.total();
    expect(transactions).toBe(4);
    expect(amount).toBe(-2);

    const shopping = captureCommand.summary.totalForCategory('shopping');
    expect(shopping.transactions).toBe(2);
    expect(shopping.amount).toBe(0);

    const other = captureCommand.summary.totalForCategory('other');
    expect(other.transactions).toBe(2);
    expect(other.amount).toBe(-2);
  });

  test('should process multiple files', async () => {
    await run(
      [
        path.join(dataDir, 'zkb-transactions.csv'),
        path.join(dataDir, 'viseca-transactions.csv'),
      ],
      inputParserFactory,
      commands
    );

    const { amount, transactions } = captureCommand.summary.total();
    expect(transactions).toBe(11);
    expect(amount).toBe(-7);
  });

  test('should expand split transactions from overrides', async () => {
    const date = moment();
    const amount = -100;
    const txs = [{ date, amount }] as Transaction[];
    const fakeParserFactory = {
      createParser: () => ({ parse: async () => txs }),
    } as unknown as InputParserFactory;

    const overrides = [
      {
        date,
        amount,
        splits: [
          { amount: -60, category: 'a' },
          { amount: -40, category: 'b' },
        ],
      },
    ] as unknown as Transaction[];

    await run(
      [createTempFile('')],
      fakeParserFactory,
      [captureCommand],
      overrides
    );

    const splitA = captureCommand.summary.totalForCategory('a');
    expect(splitA.transactions).toBe(1);
    expect(splitA.amount).toBe(-60);
    const splitB = captureCommand.summary.totalForCategory('b');
    expect(splitB.transactions).toBe(1);
    expect(splitB.amount).toBe(-40);
  });
});
