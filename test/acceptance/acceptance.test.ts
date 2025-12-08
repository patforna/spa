import * as fs from 'fs';
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

// Keep track of temp files created
const tempFiles: string[] = [];
const acceptanceDir = path.join(process.cwd(), 'test', 'acceptance');
const dataDir = path.join(acceptanceDir, 'data');

// Helper to create a temporary file with content
function createTempFile(content: string): string {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'money-test-'));
  const filePath = path.join(tempDir, 'test.csv');
  fs.writeFileSync(filePath, content, 'utf8');
  tempFiles.push(filePath);
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
  const capture = new CaptureTxsCommand();
  const inputParserFactory = new InputParserFactory(fakeFxRateService);
  const commands = [
    new CategoriseCommand(fakeRulesRepo, fakeOverridesRepo, categoriser),
    capture,
  ];

  afterAll(() => {
    tempFiles.forEach((file) => fs.rmSync(file, { force: true }));
  });

  test('should process Wise transactions', async () => {
    const input = fs.readFileSync(
      path.join(dataDir, 'wise-transactions.csv'),
      'utf8'
    );
    await run([createTempFile(input)], inputParserFactory, commands);

    const { amount, transactions } = capture.summary.total();
    expect(transactions).toBe(6);
    expect(amount).toBe(-4);

    const shopping = capture.summary.totalForCategory('shopping');
    expect(shopping.transactions).toBe(3);
    expect(shopping.amount).toBe(-1);

    const other = capture.summary.totalForCategory('other');
    expect(other.transactions).toBe(3);
    expect(other.amount).toBe(-3);
  });

  test('should process ZKB transactions', async () => {
    const input = fs.readFileSync(
      path.join(dataDir, 'zkb-transactions.csv'),
      'utf8'
    );
    await run([createTempFile(input)], inputParserFactory, commands);

    const { amount, transactions } = capture.summary.total();
    expect(transactions).toBe(5);
    expect(amount).toBe(-3);

    const shopping = capture.summary.totalForCategory('shopping');
    expect(shopping.transactions).toBe(3);
    expect(shopping.amount).toBe(-1);

    const activities = capture.summary.totalForCategory('activities');
    expect(activities.transactions).toBe(1);
    expect(activities.amount).toBe(-1);

    const other = capture.summary.totalForCategory('other');
    expect(other.transactions).toBe(1);
    expect(other.amount).toBe(-1);
  });

  test('should process Viseca transactions', async () => {
    const input = fs.readFileSync(
      path.join(dataDir, 'viseca-transactions.csv'),
      'utf8'
    );
    await run([createTempFile(input)], inputParserFactory, commands);

    const { amount, transactions } = capture.summary.total();
    expect(transactions).toBe(6);
    expect(amount).toBe(-4);
  });

  test('should process Revolut transactions', async () => {
    const input = fs.readFileSync(
      path.join(dataDir, 'revolut-transactions.csv'),
      'utf8'
    );
    await run([createTempFile(input)], inputParserFactory, commands);

    const { amount, transactions } = capture.summary.total();
    expect(transactions).toBe(4);
    expect(amount).toBe(-2);

    const shopping = capture.summary.totalForCategory('shopping');
    expect(shopping.transactions).toBe(2);
    expect(shopping.amount).toBe(0);

    const other = capture.summary.totalForCategory('other');
    expect(other.transactions).toBe(2);
    expect(other.amount).toBe(-2);
  });

  test('should process multiple files', async () => {
    const file1 = createTempFile(
      fs.readFileSync(path.join(dataDir, 'zkb-transactions.csv'), 'utf8')
    );
    const file2 = createTempFile(
      fs.readFileSync(path.join(dataDir, 'viseca-transactions.csv'), 'utf8')
    );

    await run([file1, file2], inputParserFactory, commands);

    const { amount, transactions } = capture.summary.total();
    expect(transactions).toBe(11);
    expect(amount).toBe(-7);
  });
});
