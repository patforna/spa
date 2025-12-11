import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { Prompter } from '../../lib/commands/categorise.js';
import { Command } from '../../lib/commands/index.js';
import { Override, Transaction } from '../../lib/transactions.js';
import { Rules } from '../../lib/rules.js';
import { Wiring } from '../../lib/wiring.js';
import { makeOverride, makeTx } from '../helpers.js';

const RULES_FILE = 'rules.json';
const OVERRIDES_FILE = 'overrides.json';

class CaptureTxsCommand implements Command {
  txs: Transaction[] = [];
  execute = async (txs: Transaction[]) => void (this.txs = txs);
}

let tempDir: string;
let captureCommand: CaptureTxsCommand;

describe('Acceptance tests', () => {
  beforeEach(() => {
    resetTempDir();
    captureCommand = new CaptureTxsCommand();
  });

  test('should categorise transaction by matching rule', async () => {
    const txs = [makeTx({ description: 'MIGROS supermarket' })];
    const rules: Rules = {
      groceries: [/MIGROS/],
    };

    await run({ txs, rules });

    expect(captureCommand.txs).toHaveLength(1);
    expect(captureCommand.txs[0].category).toBe('groceries');
  });

  test('should categorise transaction by matching override', async () => {
    const txs = [makeTx({ amount: -50, description: 'Some store' })];
    const overrides = [
      makeOverride({
        date: txs[0].date,
        amount: txs[0].amount,
        category: 'shopping',
        comment: 'birthday gift',
      }),
    ];

    await run({ txs, overrides });

    expect(captureCommand.txs).toHaveLength(1);
    expect(captureCommand.txs[0].category).toBe('shopping');
    expect(captureCommand.txs[0].comment).toBe('birthday gift');
  });

  test('should prefer override over rule', async () => {
    const txs = [makeTx({ amount: -50, description: 'MIGROS supermarket' })];
    const rules: Rules = {
      groceries: [/MIGROS/],
    };
    const overrides = [
      makeOverride({
        date: txs[0].date,
        amount: txs[0].amount,
        category: 'gifts',
      }),
    ];

    await run({ txs, rules, overrides });

    expect(captureCommand.txs).toHaveLength(1);
    expect(captureCommand.txs[0].category).toBe('gifts');
  });

  test('should prompt user to categorise uncategorised transactions', async () => {
    const txs = [makeTx({ amount: -50 })];
    const fakePrompter: Prompter = {
      promptForCategory: async () => 'groceries',
      promptForComment: async () => 'weekly grocery shop',
      promptForAmount: async () => 0,
    };

    await run({ txs, prompter: fakePrompter });

    expect(captureCommand.txs).toHaveLength(1);
    expect(captureCommand.txs[0].category).toBe('groceries');
    expect(captureCommand.txs[0].amount).toBe(-50);

    const overridesPath = path.join(tempDir, OVERRIDES_FILE);
    const savedOverrides = JSON.parse(fs.readFileSync(overridesPath, 'utf8'));
    expect(savedOverrides).toHaveLength(1);
    expect(savedOverrides[0].category).toBe('groceries');
    expect(savedOverrides[0].comment).toBe('weekly grocery shop');
  });

  test('should expand split transactions from overrides', async () => {
    const txs = [makeTx({ amount: -100 })];
    const overrides = [
      makeOverride({
        date: txs[0].date,
        amount: txs[0].amount,
        splits: [
          { amount: -60, category: 'a' },
          { amount: -40, category: 'b' },
        ],
      }),
    ];

    await run({ txs, overrides });

    expect(captureCommand.txs).toHaveLength(2);
    expect(captureCommand.txs[0].amount).toBe(-60);
    expect(captureCommand.txs[0].category).toBe('a');
    expect(captureCommand.txs[1].amount).toBe(-40);
    expect(captureCommand.txs[1].category).toBe('b');
  });
});

function resetTempDir(): void {
  if (tempDir) {
    fs.rmSync(tempDir, { recursive: true });
  }
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'money-test-'));
}

function createInputFile(txs: Transaction[]): string {
  return writeJson('input.json', txs);
}

function createRulesFile(rules: Rules): string {
  return writeJson(RULES_FILE, serializeRules(rules));
}

function createOverridesFile(overrides: Override[]): string {
  return writeJson(OVERRIDES_FILE, overrides);
}

/**
 * Runs the app with the given config. Results are captured in `captureCommand`.
 */
async function run({
  txs = [],
  rules = {},
  overrides = [],
  prompter,
}: {
  txs?: Transaction[];
  rules?: Rules;
  overrides?: Override[];
  prompter?: Prompter;
} = {}): Promise<void> {
  const wiring = new Wiring({
    rulesPath: createRulesFile(rules),
    overridesPath: createOverridesFile(overrides),
    prompter,
  });
  await wiring.app.run(
    [createInputFile(txs)],
    [wiring.categoriseCommand, captureCommand]
  );
}

function writeJson(filename: string, data: unknown): string {
  const filePath = path.join(tempDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(data));
  return filePath;
}

function serializeRules(rules: Rules): { [category: string]: string[] } {
  const result: { [category: string]: string[] } = {};
  for (const [category, patterns] of Object.entries(rules)) {
    result[category] = patterns.map((r) => r.source);
  }
  return result;
}
