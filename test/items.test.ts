import { shortDescription } from '../lib/items.js';
import { makeItem } from './factories/itemFactory.js';

describe('shortDescription', () => {
  test('should clean up empty fields in description', () => {
    const item = makeItem({
      description: 'Sportshop |  |  | SportShop | #viseca',
    });

    const desc = shortDescription(item);
    expect(desc).not.toContain('|  |');
    expect(desc).toBe('Sportshop | SportShop | #viseca');
  });

  test('should remove noise from description', () => {
    const items = [
      makeItem({
        description: 'CARD_TRANSACTION-1234 | OUT | Amazon | CHE | #wise',
      }),
      makeItem({
        description:
          'Purchase ZKB Visa Debit card no. xxxx 1234, Merchant Name | #zkb',
      }),
      makeItem({
        description: 'Debit eBanking Mobile (2) | Some Info | #zkb',
      }),
    ];

    const descriptions = items.map(shortDescription);

    expect(descriptions[0]).toBe('Amazon | #wise');
    expect(descriptions[1]).toBe('Merchant Name | #zkb');
    expect(descriptions[2]).toBe('Some Info | #zkb');
  });
});
