import { Card } from '../../../lib/transactions.js';
import { VisecaInputParser } from '../../../lib/parsers/viseca.js';

describe('VisecaInputParser', () => {
  const parser = new VisecaInputParser();

  const csvHeader =
    'TransactionId,CardId,Date,ValutaDate,Amount,Currency,' +
    'OriginalAmount,OriginalCurrency,MerchantName,MerchantPlace,' +
    'MerchantCountry,StateType,Details,Type,Exchange Rate';

  function makeCsv(cardId: string): string {
    return (
      `${csvHeader}\n` +
      `,"${cardId}","01/01/2025 00:00:00","","1.00","CHF","","",` +
      `"Test","Place","CHE","BOOKED","Details","","1.000000"`
    );
  }

  test('should parse transaction as negative amount', async () => {
    const csv =
      `${csvHeader}\n` +
      `,"CARD123","01/01/2025 00:00:00","","50.00","","","",` +
      `"Shop","Zurich","CHE","BOOKED","Shop Details","","1.000000"`;
    const txs = await parser.parse(csv);

    expect(txs).toHaveLength(1);
    expect(txs[0].amount).toBe(-50);
    expect(txs[0].description).toContain('Shop');
    expect(txs[0].description).toContain('#viseca');
  });

  test('should parse negative amount (refund) as positive', async () => {
    const csv =
      `${csvHeader}\n` +
      `,"CARD123","01/01/2025 00:00:00","","-25.00","","","",` +
      `"Refund","Zurich","CHE","BOOKED","Refund Details","","1.000000"`;
    const txs = await parser.parse(csv);

    expect(txs).toHaveLength(1);
    expect(txs[0].amount).toBe(25);
  });

  test('should filter out non-BOOKED transactions', async () => {
    const csv =
      `${csvHeader}\n` +
      `,"CARD123","01/01/2025 00:00:00","","50.00","","","",` +
      `"Shop","Zurich","CHE","PENDING","Details","","1.000000"`;
    const txs = await parser.parse(csv);

    expect(txs).toHaveLength(0);
  });

  test('should include merchant info in description', async () => {
    const csv =
      `${csvHeader}\n` +
      `,"CARD123","01/01/2025 00:00:00","","10.00","","","",` +
      `"Coop","Winterthur","CHE","BOOKED","Coop-2623","","1.000000"`;
    const txs = await parser.parse(csv);

    expect(txs[0].description).toContain('Coop');
    expect(txs[0].description).toContain('Winterthur');
    expect(txs[0].description).toContain('CHE');
    expect(txs[0].description).toContain('Coop-2623');
  });

  test('should identify card ending with 0002 as Self', async () => {
    const txs = await parser.parse(makeCsv('404703ES07AN0002'));
    expect(txs[0].card).toBe(Card.Self);
  });

  test('should identify card ending with 1250 as Partner', async () => {
    const txs = await parser.parse(makeCsv('40470327O1OX1250'));
    expect(txs[0].card).toBe(Card.Partner);
  });

  test('should identify card ending with 4471 as Partner', async () => {
    const txs = await parser.parse(makeCsv('404703RSL62F4471'));
    expect(txs[0].card).toBe(Card.Partner);
  });

  test('should identify unknown card suffix as Unknown', async () => {
    const txs = await parser.parse(makeCsv('XXXX9999'));
    expect(txs[0].card).toBe(Card.Unknown);
  });

  test('should handle null cardId as Unknown', async () => {
    const csv =
      `${csvHeader}\n` +
      `,,"01/01/2025 00:00:00","","1.00","CHF","","",` +
      `"Test","Place","CHE","BOOKED","Details","","1.000000"`;
    const txs = await parser.parse(csv);
    expect(txs[0].card).toBe(Card.Unknown);
  });

  test('should identify card ending with 0219 as Self', async () => {
    const txs = await parser.parse(makeCsv('540948603TJZ0219'));
    expect(txs[0].card).toBe(Card.Self);
  });
});
