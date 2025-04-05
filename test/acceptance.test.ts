import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { Categoriser } from '../lib/categoriser.js';
import { CategoriseCommand } from '../lib/commands/categorise.js';
import { Command } from '../lib/commands/index.js';
import { FxRateService } from '../lib/fxRates.js';
import { Item, ItemRepo } from '../lib/items.js';
import { run } from '../lib/main.js';
import { InputParserFactory } from '../lib/parsers/index.js';
import { Rules, RulesRepo } from '../lib/rules.js';
import { Summary } from '../lib/summary.js';

// Keep track of temp files created
const tempFiles: string[] = [];
const testDir = path.join(process.cwd(), 'test');

// Helper to create a temporary file with content
function createTempFile(content: string): string {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'money-test-'));
  const filePath = path.join(tempDir, 'test.csv');
  fs.writeFileSync(filePath, content, 'utf8');
  tempFiles.push(filePath);
  return filePath;
}

class CaptureItemsCommand implements Command {
  summary: Summary;

  async execute(items: Item[]): Promise<void> {
    this.summary = new Summary(items);
  }
}

// Fake FX rate service for testing
const fakeRulesRepo = {
  load(): Rules {
    return {
      shopping: [new RegExp('#shopping', 'i')],
      ignore: [new RegExp('#ignore', 'i')],
      other: [new RegExp('.*', 'i')],
    };
  },
} as unknown as RulesRepo;

// Fake FX rate service for testing
const fakeFxRateService = {
  convert: async (from: string, to: string, amount: number) => {
    if (from === 'GBP' && to === 'CHF') return amount * 1.1; // Example GBP to CHF rate
    if (from === 'EUR' && to === 'CHF') return amount * 0.9; // Example EUR to CHF rate
    throw new Error(`Unsupported currency conversion from ${from} to ${to}`);
  },
} as unknown as FxRateService;

describe('Acceptance tests', () => {
  const overridesRepo = new ItemRepo(createTempFile(JSON.stringify([])));
  const categoriser = new Categoriser(
    fakeRulesRepo.load(),
    overridesRepo.load()
  );
  const capture = new CaptureItemsCommand();
  const inputParserFactory = new InputParserFactory(fakeFxRateService);
  const commands = [
    new CategoriseCommand(fakeRulesRepo, overridesRepo, categoriser),
    capture,
  ];

  afterAll(() => {
    tempFiles.forEach((file) => fs.rmSync(file, { force: true }));
  });

  test('should process FKB transactions', async () => {
    const input = fs.readFileSync(
      path.join(testDir, 'fkb-transactions.csv'),
      'latin1'
    );
    await run([createTempFile(input)], inputParserFactory, commands);

    const { amount, transactions } = capture.summary.total();
    expect(transactions).toBe(4);
    expect(amount).toBe(310);
  });

  test('should process Wise transactions', async () => {
    const input = fs.readFileSync(
      path.join(testDir, 'wise-transactions.csv'),
      'utf8'
    );
    await run([createTempFile(input)], inputParserFactory, commands);

    // const { amount, transactions } = capture.summary.total();
    // expect(transactions).toBe(6);
    // expect(amount).toBe(264);

    const shopping = capture.summary.totalForCategory('shopping');
    expect(shopping.transactions).toBe(3);
    expect(shopping.amount).toBe(41);

    const other = capture.summary.totalForCategory('other');
    expect(other.transactions).toBe(3);
    expect(other.amount).toBe(250);
  });

  test('should process ZKB transactions', async () => {
    const input = fs.readFileSync(
      path.join(testDir, 'zkb-transactions.csv'),
      'utf8'
    );
    await run([createTempFile(input)], inputParserFactory, commands);

    const { amount, transactions } = capture.summary.total();
    expect(transactions).toBe(4);
    expect(amount).toBe(183);
  });

  test('should process Viseca transactions', async () => {
    const input = fs.readFileSync(
      path.join(testDir, 'viseca-transactions.csv'),
      'utf8'
    );
    await run([createTempFile(input)], inputParserFactory, commands);

    const { amount, transactions } = capture.summary.total();
    expect(transactions).toBe(5);
    expect(amount).toBe(1643);
  });

  test('should process Revolut transactions', async () => {
    const input = fs.readFileSync(
      path.join(testDir, 'revolut-transactions.csv'),
      'utf8'
    );
    await run([createTempFile(input)], inputParserFactory, commands);

    const { amount, transactions } = capture.summary.total();
    expect(transactions).toBe(5);
    expect(amount).toBe(613);
  });

  test('should process additional transactions', async () => {
    const input = fs.readFileSync(
      path.join(testDir, 'additional-transactions.json'),
      'utf8'
    );
    await run([createTempFile(input)], inputParserFactory, commands);

    const { amount, transactions } = capture.summary.total();
    expect(transactions).toBe(3);
    expect(amount).toBe(2982);
  });

  test('should process multiple files', async () => {
    const file1 = createTempFile(
      fs.readFileSync(path.join(testDir, 'zkb-transactions.csv'), 'utf8')
    );
    const file2 = createTempFile(
      fs.readFileSync(path.join(testDir, 'viseca-transactions.csv'), 'utf8')
    );

    await run([file1, file2], inputParserFactory, commands);

    const { amount, transactions } = capture.summary.total();
    expect(transactions).toBe(9);
    expect(amount).toBe(1826);
  });

  test('should categorise transactions', async () => {
    const input = fs.readFileSync(
      path.join(testDir, 'revolut-transactions.csv'),
      'utf8'
    );
    await run([createTempFile(input)], inputParserFactory, commands);

    const shopping = capture.summary.totalForCategory('shopping');
    expect(shopping.transactions).toBe(2);
    expect(shopping.amount).toBe(172);

    const other = capture.summary.totalForCategory('other');
    expect(other.transactions).toBe(3);
    expect(other.amount).toBe(441);
  });
});
