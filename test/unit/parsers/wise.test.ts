import { Card } from '../../../lib/transactions.js';
import { WiseInputParser } from '../../../lib/parsers/wise.js';
import { FxRateService } from '../../../lib/fxRates.js';

describe('WiseInputParser', () => {
  const fakeFxRateService = {
    convert: async (_from: string, _to: string, amount: number) => amount,
  } as unknown as FxRateService;

  const parser = new WiseInputParser(fakeFxRateService);

  // 21 columns: ID through Note
  const csvHeader =
    'ID,Status,Direction,"Created on","Finished on",' +
    '"Source fee amount","Source fee currency","Target fee amount",' +
    '"Target fee currency","Source name","Source amount (after fees)",' +
    '"Source currency","Target name","Target amount (after fees)",' +
    '"Target currency","Exchange rate",Reference,Batch,"Created by",Category,Note';

  test('should parse OUT transaction as negative amount', async () => {
    const csv =
      `${csvHeader}\n` +
      `,"COMPLETED","OUT","2025-01-01 00:00:00","","","","","",` +
      `"Me",50.00,GBP,"Shop","","","","","","","",""`;
    const txs = await parser.parse(csv);

    expect(txs).toHaveLength(1);
    expect(txs[0].amount).toBe(-50);
    expect(txs[0].description).toContain('Shop');
    expect(txs[0].description).toContain('#wise');
  });

  test('should parse IN transaction as positive amount', async () => {
    const csv =
      `${csvHeader}\n` +
      `,"COMPLETED","IN","2025-01-01 00:00:00","","","","","",` +
      `"Sender",25.00,GBP,"Me","","","","","","","",""`;
    const txs = await parser.parse(csv);

    expect(txs).toHaveLength(1);
    expect(txs[0].amount).toBe(25);
  });

  test('should use source name as merchant for REFUNDED transactions', async () => {
    const csv =
      `${csvHeader}\n` +
      `,"REFUNDED","IN","2025-01-01 00:00:00","","","","","",` +
      `"Amazon",30.00,GBP,"Me","","","","","","","",""`;
    const txs = await parser.parse(csv);

    expect(txs[0].description).toContain('Amazon');
  });

  test('should filter out transactions with zero amount', async () => {
    const csv =
      `${csvHeader}\n` +
      `,"COMPLETED","OUT","2025-01-01 00:00:00","","","","","",` +
      `"Me",0,GBP,"Shop","","","","","","","",""`;
    const txs = await parser.parse(csv);

    expect(txs).toHaveLength(0);
  });

  test('should include direction in description', async () => {
    const csv =
      `${csvHeader}\n` +
      `,"COMPLETED","OUT","2025-01-01 00:00:00","","","","","",` +
      `"Me",10.00,GBP,"Shop","","","","","","","",""`;
    const txs = await parser.parse(csv);

    expect(txs[0].description).toContain('OUT');
  });

  test('should always assign Unknown as card owner', async () => {
    const csv =
      `${csvHeader}\n` +
      `,"COMPLETED","OUT","2025-01-01 00:00:00","","","","","",` +
      `"Me",10.00,GBP,"Shop","","","","","","","",""`;
    const txs = await parser.parse(csv);

    expect(txs[0].card).toBe(Card.Unknown);
  });

  test('should filter out NEUTRAL direction (balance transactions)', async () => {
    const csv =
      `${csvHeader}\n` +
      `,"COMPLETED","NEUTRAL","2025-01-01 00:00:00","","","","","",` +
      `"Me",100.00,CHF,"Me","","","","","","","",""`;
    const txs = await parser.parse(csv);

    expect(txs).toHaveLength(0);
  });
});
