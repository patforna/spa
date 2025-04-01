import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { Categoriser } from '../lib/categoriser.js';
import { CategoriseCommand } from '../lib/commands/categorise.js';
import { Command } from '../lib/commands/index.js';
import { Item, ItemRepo } from '../lib/items.js';
import { run } from '../lib/main.js';
import { Summary } from '../lib/summary.js';

// Keep track of temp files created
const tempFiles: string[] = [];
const testDir = path.join(process.cwd(), 'test');

// Helper to create a temporary file with content
function createTempFile(content: string): string {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'money-test-'));
  const filePath = path.join(tempDir, 'test.csv');
  fs.writeFileSync(filePath, content, { encoding: 'latin1' }); // Match the ENCODING from main.ts
  tempFiles.push(filePath);
  return filePath;
}

class CaptureItemsCommand implements Command {
  summary: Summary;

  async execute(items: Item[]): Promise<void> {
    this.summary = new Summary(items);
  }
}

describe('Acceptance tests', () => {
  const additionalsRepo = new ItemRepo(createTempFile(JSON.stringify([])));
  const overridesRepo = new ItemRepo(createTempFile(JSON.stringify([])));
  const categoriser = new Categoriser(overridesRepo.load());
  const capture = new CaptureItemsCommand();
  const commands = [new CategoriseCommand(overridesRepo, categoriser), capture];

  afterAll(() => {
    tempFiles.forEach((file) => fs.rmSync(file, { force: true }));
  });

  test('should process FKB transactions', async () => {
    const input = fs.readFileSync(
      path.join(testDir, 'fkb-transactions.csv'),
      'latin1'
    );
    await run(createTempFile(input), additionalsRepo, commands);

    const { amount, transactions } = capture.summary.total();
    expect(transactions).toBe(4);
    expect(amount).toBe(310); // Sum of absolute values
  });
});
