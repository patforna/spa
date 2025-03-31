import { Command } from '../lib/commands/index.js';
import { CategoriseCommand } from '../lib/commands/categorise.js';
import { Item } from '../lib/items.js';
import { run } from '../lib/main.js';
import { Summary } from '../lib/summary.js';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Helper to create a temporary file with content
function createTempFile(content: string): string {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'money-test-'));
  const filePath = path.join(tempDir, 'test.csv');
  fs.writeFileSync(filePath, content, { encoding: 'latin1' }); // Match the ENCODING from main.ts
  return filePath;
}

const csv = `Kontoauszug bis: 06.12.2020 ;;;
;;;
Kontonummer: 30 01 511.262-00;;;
Bezeichnung: Lohnkonto;;;
Saldo: CHF 6120.12;;;
;;;
Muster Hans & Muster Anna;;;
Seefeldstrasse 12;;;
8008 Zürich;;;
;;;
;;;
Datum;Buchungstext;Betrag;Valuta
04.12.20;E-Banking-Auftrag Muster Anna;-281.65;03.12.20
04.12.20;Zahlung - Coop-5178 ZH Seefeldst, Zürich - 02.12.2020 18:40 - Karten-Nr. xxxxxxxxxxxx6107;-1.25;02.12.20
03.12.20;Zahlung - Coop-2623 City SM, Zürich - 01.12.2020 15:29 - Karten-Nr. xxxxxxxxxxxx7837;-19.35;01.12.20
03.12.20;Zahlung - Migros ALN Kreuzplatz, Zürich - 01.12.2020 10:00 - Karten-Nr. xxxxxxxxxxxx7837;-8.05;01.12.20`;

// FIXME note this test is super brittle, because it:
// - relies on rules.ts
// - pulls in data from additionals.json
// - potentially interferes with overrides.json
class CaptureItemsCommand implements Command {
  summary: Summary;

  async execute(items: Item[]): Promise<void> {
    this.summary = new Summary(items);
  }
}

describe('Acceptance tests', () => {
  let tempFile: string;
  let tempDir: string;

  beforeAll(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'money-test-'));
    tempFile = path.join(tempDir, 'test.csv');
    fs.writeFileSync(tempFile, csv, { encoding: 'latin1' });
  });

  afterAll(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test('should process basic transactions', async () => {
    const capture = new CaptureItemsCommand();
    await run(tempFile, [new CategoriseCommand(), capture], {
      ignoreAdditionals: true,
    });

    const { amount, transactions } = capture.summary.total();
    expect(transactions).toBe(4);
    expect(amount).toBe(310); // Sum of absolute values
  });
});
