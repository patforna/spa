import { shortDescription } from '../lib/transactions.js';
import { makeTx } from './factories/transactionFactory.js';

describe('shortDescription', () => {
  test('should clean up empty fields in description', () => {
    const tx = makeTx({
      description: 'Sportshop |  |  | SportShop | #viseca',
    });

    const desc = shortDescription(tx);
    expect(desc).not.toContain('|  |');
    expect(desc).toBe('Sportshop | SportShop | #viseca');
  });

  test('should remove noise from description', () => {
    const txs = [
      makeTx({
        description: 'CARD_TRANSACTION-1234 | OUT | Amazon | CHE | #wise',
      }),
      makeTx({
        description:
          'Purchase ZKB Visa Debit card no. xxxx 1234, Merchant Name | #zkb',
      }),
      makeTx({
        description: 'Debit eBanking Mobile (2) | Some Info | #zkb',
      }),
    ];

    const descriptions = txs.map(shortDescription);

    expect(descriptions[0]).toBe('Amazon | #wise');
    expect(descriptions[1]).toBe('Merchant Name | #zkb');
    expect(descriptions[2]).toBe('Some Info | #zkb');
  });
});
