import { Card } from '../../../lib/transactions.js';
import { VisecaInputParser } from '../../../lib/parsers/viseca.js';

describe('VisecaInputParser', () => {
  const parser = new VisecaInputParser();

  const csvHeader =
    'TransactionId,CardId,Date,ValutaDate,Amount,Currency,' +
    'OriginalAmount,OriginalCurrency,MerchantName,MerchantPlace,' +
    'MerchantCountry,StateType,Details,Type';

  function makeCsv(cardId: string): string {
    return (
      `${csvHeader}\n` +
      `,"${cardId}","01/01/2025 00:00:00","","1.00","CHF","","",` +
      `"Test","Place","CHE","BOOKED","Details",""`
    );
  }

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
});
