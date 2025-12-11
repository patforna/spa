import { Card } from '../../../lib/transactions.js';
import { ZKBInputParser } from '../../../lib/parsers/zkb.js';

describe('ZKBInputParser', () => {
  const parser = new ZKBInputParser();

  const csvHeader =
    '"Date";"Booking text";"Curr";"Amount details";"ZKB reference";' +
    '"Reference number";"Debit CHF";"Credit CHF";"Value date";' +
    '"Balance CHF";"Payment purpose";"Details"';

  test('should parse debit transaction', async () => {
    const csv = `${csvHeader}\n"01.01.2025";"Shop";"";"";"";"";"100.00";"";"";"";"";""`;
    const txs = await parser.parse(csv);

    expect(txs).toHaveLength(1);
    expect(txs[0].amount).toBe(-100);
    expect(txs[0].description).toContain('Shop');
    expect(txs[0].description).toContain('#zkb');
  });

  test('should parse credit transaction', async () => {
    const csv = `${csvHeader}\n"01.01.2025";"Refund";"";"";"";"";"";"50.00";"";"";"";""`;
    const txs = await parser.parse(csv);

    expect(txs).toHaveLength(1);
    expect(txs[0].amount).toBe(50);
  });

  test('should include payment purpose in description', async () => {
    const csv = `${csvHeader}\n"01.01.2025";"Payment";"";"";"";"";"10.00";"";"";"";"common money";""`;
    const txs = await parser.parse(csv);

    expect(txs[0].description).toContain('common money');
  });

  test('should split multi-line transaction into separate transactions', async () => {
    const csv =
      `${csvHeader}\n` +
      `"01.01.2025";"Parent";"";"";"";"";"100.00";"";"";"";"";""` +
      `\n"";"Child 1";"";"60.00";"";"";"";"";"";"";"";""` +
      `\n"";"Child 2";"";"40.00";"";"";"";"";"";"";"";""`;
    const txs = await parser.parse(csv);

    expect(txs).toHaveLength(2);
    expect(txs[0].amount).toBe(-60);
    expect(txs[0].description).toContain('Child 1');
    expect(txs[1].amount).toBe(-40);
    expect(txs[1].description).toContain('Child 2');
  });

  test('should always assign Unknown as card owner', async () => {
    const csv = `${csvHeader}\n"01.01.2025";"Payment";"";"";"";"";"100.00";"";"";"";"";""`;
    const txs = await parser.parse(csv);

    expect(txs[0].card).toBe(Card.Unknown);
  });
});
