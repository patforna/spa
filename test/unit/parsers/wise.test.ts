import { Card } from '../../../lib/transactions.js';
import { WiseInputParser } from '../../../lib/parsers/wise.js';
import { FxRateService } from '../../../lib/fxRates.js';

describe('WiseInputParser', () => {
  const fakeFxRateService = {
    convert: async (_from: string, _to: string, amount: number) => amount,
  } as unknown as FxRateService;

  const parser = new WiseInputParser(fakeFxRateService);

  const csvHeader =
    'ID,Status,Direction,Created on,Finished on,' +
    'Source fee amount,Source fee currency,Target fee amount,' +
    'Target fee currency,Source name,Source amount (after fees),' +
    'Source currency,Target name,Target amount (after fees),' +
    'Target currency,Exchange rate,Reference,Batch';

  function makeCsv(): string {
    return (
      `${csvHeader}\n` +
      `123,COMPLETED,OUT,2025-01-01 10:00:00,2025-01-01 10:00:00,` +
      `0,CHF,0,CHF,Me,100,CHF,Them,100,CHF,1,Test,`
    );
  }

  test('should always assign Unknown as card owner', async () => {
    const txs = await parser.parse(makeCsv());
    expect(txs[0].card).toBe(Card.Unknown);
  });
});
