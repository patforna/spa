import { Card } from '../../../lib/transactions.js';
import { ZKBInputParser } from '../../../lib/parsers/zkb.js';

describe('ZKBInputParser', () => {
  const parser = new ZKBInputParser();

  const csvHeader =
    '"Date";"Booking text";"Amount details";"Debit CHF";"Credit CHF";' +
    '"Valuta date";"Balance CHF";"Payment purpose"';

  function makeCsv(): string {
    return `${csvHeader}\n"01.01.2025";"Payment";"";"-100.00";"";"";"";"Test"`;
  }

  test('should always assign Unknown as card owner', async () => {
    const txs = await parser.parse(makeCsv());
    expect(txs[0].card).toBe(Card.Unknown);
  });
});
