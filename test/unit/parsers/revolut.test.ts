import { Card } from '../../../lib/transactions.js';
import { RevolutInputParser } from '../../../lib/parsers/revolut.js';
import { FxRateService } from '../../../lib/fxRates.js';

describe('RevolutInputParser', () => {
  const fakeFxRateService = {
    convert: async (_from: string, _to: string, amount: number) => amount,
  } as unknown as FxRateService;

  const parser = new RevolutInputParser(fakeFxRateService);

  const csvHeader =
    'Type,Product,Started Date,Completed Date,Description,' +
    'Amount,Fee,Currency,State,Balance';

  function makeCsv(): string {
    return (
      `${csvHeader}\n` +
      `CARD_PAYMENT,Current,2025-01-01 10:00:00,2025-01-01 10:00:00,` +
      `Test,-1.00,0.00,CHF,COMPLETED,100.00`
    );
  }

  test('should always assign Patric as card owner', async () => {
    const txs = await parser.parse(makeCsv());
    expect(txs[0].card).toBe(Card.Self);
  });
});
