import dayjs from '../../lib/date.js';
import {
  Card,
  expandSplits,
  shortDescription,
  Override,
} from '../../lib/transactions.js';
import { makeTx } from './factories/transactionFactory.js';

describe('expandSplits', () => {
  const date = dayjs.utc('2025-01-15');

  test('should replace parent transaction with split children', () => {
    const txs = [makeTx({ date, amount: -200 })];
    const overrides: Override[] = [
      {
        ...makeTx({
          date,
          amount: -200,
        }),
        splits: [
          makeTx({ amount: -50, category: 'a' }),
          makeTx({ amount: -150, category: 'b' }),
        ],
      },
    ];

    expandSplits(txs, overrides);
    expect(txs).toHaveLength(2);
    expect(txs[0].amount).toBe(-50);
    expect(txs[0].category).toBe('a');
    expect(txs[1].amount).toBe(-150);
    expect(txs[1].category).toBe('b');
  });

  test('should inherit date, description, and card from parent', () => {
    const txs = [
      makeTx({ date, amount: -100, description: 'Store', card: Card.Self }),
    ];
    const overrides: Override[] = [
      {
        ...makeTx({
          date,
          amount: -100,
        }),
        splits: [makeTx({ amount: -100, category: 'shopping' })],
      },
    ];

    expandSplits(txs, overrides);
    expect(txs[0].date.isSame(date)).toBe(true);
    expect(txs[0].description).toBe('Store');
    expect(txs[0].card).toBe(Card.Self);
  });

  test('should expand splits in place preserving order', () => {
    const txs = [
      makeTx({ date, amount: -10, category: 'a' }),
      makeTx({ date, amount: -20, category: 'b' }),
      makeTx({ date, amount: -30, category: 'c' }),
    ];
    const overrides: Override[] = [
      {
        ...makeTx({
          date,
          amount: -20,
        }),
        splits: [
          makeTx({ category: 'u' }),
          makeTx({ category: 'v' }),
          makeTx({ category: 'w' }),
        ],
      },
    ];

    expandSplits(txs, overrides);
    expect(txs.map((t) => t.category)).toEqual(['a', 'u', 'v', 'w', 'c']);
  });
});

describe('shortDescription', () => {
  test('should clean up empty fields in description', () => {
    const tx = makeTx({
      description: 'Sportshop |  |  | SportShop | #viseca',
    });

    const desc = shortDescription(tx.description);
    expect(desc).not.toContain('|  |');
    expect(desc).toBe('Sportshop | SportShop | #viseca');
  });

  test('should remove noise from description', () => {
    const txs = [
      makeTx({
        description: 'OUT | Amazon | CHE | #wise',
      }),
      makeTx({
        description:
          'Purchase ZKB Visa Debit card no. xxxx 1234, Merchant Name | #zkb',
      }),
      makeTx({
        description: 'Debit eBanking Mobile (2) | Some Info | #zkb',
      }),
    ];

    const descriptions = txs.map((tx) => shortDescription(tx.description));

    expect(descriptions[0]).toBe('Amazon | #wise');
    expect(descriptions[1]).toBe('Merchant Name | #zkb');
    expect(descriptions[2]).toBe('Some Info | #zkb');
  });
});
