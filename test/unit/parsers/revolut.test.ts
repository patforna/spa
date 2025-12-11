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

  test('should parse card payment as negative amount', async () => {
    const csv =
      `${csvHeader}\n` +
      `CARD_PAYMENT,,"","2025-01-01 00:00:00","Shop",-50.00,0.00,CHF,COMPLETED,""`;
    const txs = await parser.parse(csv);

    expect(txs).toHaveLength(1);
    expect(txs[0].amount).toBe(-50);
    expect(txs[0].description).toContain('Shop');
    expect(txs[0].description).toContain('#revolut');
  });

  test('should parse refund as positive amount', async () => {
    const csv =
      `${csvHeader}\n` +
      `CARD_REFUND,,"","2025-01-01 00:00:00","Refund",25.00,0.00,CHF,COMPLETED,""`;
    const txs = await parser.parse(csv);

    expect(txs).toHaveLength(1);
    expect(txs[0].amount).toBe(25);
  });

  test('should filter out TOPUP transactions', async () => {
    const csv =
      `${csvHeader}\n` +
      `TOPUP,,"","2025-01-01 00:00:00","Payment from Someone",100.00,0.00,CHF,COMPLETED,""`;
    const txs = await parser.parse(csv);

    expect(txs).toHaveLength(0);
  });

  test('should filter out non-COMPLETED transactions', async () => {
    const csv =
      `${csvHeader}\n` +
      `CARD_PAYMENT,,"","2025-01-01 00:00:00","Shop",-50.00,0.00,CHF,PENDING,""`;
    const txs = await parser.parse(csv);

    expect(txs).toHaveLength(0);
  });

  test('should include transaction type in description', async () => {
    const csv =
      `${csvHeader}\n` +
      `ATM,,"","2025-01-01 00:00:00","Cash withdrawal",-100.00,1.00,CHF,COMPLETED,""`;
    const txs = await parser.parse(csv);

    expect(txs[0].description).toContain('ATM');
  });

  test('should always assign Patric as card owner', async () => {
    const csv =
      `${csvHeader}\n` +
      `CARD_PAYMENT,,"","2025-01-01 00:00:00","Test",-1.00,0.00,CHF,COMPLETED,""`;
    const txs = await parser.parse(csv);

    expect(txs[0].card).toBe(Card.Self);
  });

  test('should filter out TRANSFER transactions', async () => {
    const csv =
      `${csvHeader}\n` +
      `TRANSFER,,"","2025-01-01 00:00:00","Transfer from Someone",50.00,0.00,CHF,COMPLETED,""`;
    const txs = await parser.parse(csv);

    expect(txs).toHaveLength(0);
  });
});
