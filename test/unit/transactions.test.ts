import dayjs from '../../lib/date.js';
import {
  Card,
  Override,
  shortDescription,
  TxLoader,
} from '../../lib/transactions.js';
import { InputParserFactory } from '../../lib/parsers/index.js';
import { FxRateService } from '../../lib/fxRates.js';
import { makeTx } from '../helpers.js';

const fakeFxRateService = {
  convert: async (_from: string, _to: string, amount: number) => amount,
} as unknown as FxRateService;

describe('TxLoader.expandSplits', () => {
  const date = dayjs.utc('2025-01-15');

  function createLoader(overrides: Override[]): TxLoader {
    const inputParserFactory = new InputParserFactory(fakeFxRateService);
    return new TxLoader(inputParserFactory, overrides);
  }

  test('should replace parent transaction with split children', async () => {
    const txs = [makeTx({ date, amount: -200 })];
    const overrides: Override[] = [
      {
        date,
        amount: -200,
        category: '',
        comment: '',
        splits: [
          { amount: -50, category: 'a', comment: '' },
          { amount: -150, category: 'b', comment: '' },
        ],
      },
    ];

    const loader = createLoader(overrides);
    const result = await loader.loadFromTransactions(txs);

    expect(result).toHaveLength(2);
    expect(result[0].amount).toBe(-50);
    expect(result[0].category).toBe('a');
    expect(result[1].amount).toBe(-150);
    expect(result[1].category).toBe('b');
  });

  test('should inherit date, description, and card from parent', async () => {
    const txs = [
      makeTx({ date, amount: -100, description: 'Store', card: Card.Self }),
    ];
    const overrides: Override[] = [
      {
        date,
        amount: -100,
        category: '',
        comment: '',
        splits: [{ amount: -100, category: 'shopping', comment: '' }],
      },
    ];

    const loader = createLoader(overrides);
    const result = await loader.loadFromTransactions(txs);

    expect(result[0].date.isSame(date)).toBe(true);
    expect(result[0].description).toBe('Store');
    expect(result[0].card).toBe(Card.Self);
  });

  test('should expand splits in place preserving order', async () => {
    const txs = [
      makeTx({ date, amount: -10, category: 'a' }),
      makeTx({ date, amount: -20, category: 'b' }),
      makeTx({ date, amount: -30, category: 'c' }),
    ];
    const overrides: Override[] = [
      {
        date,
        amount: -20,
        category: '',
        comment: '',
        splits: [
          { amount: 0, category: 'u', comment: '' },
          { amount: 0, category: 'v', comment: '' },
          { amount: 0, category: 'w', comment: '' },
        ],
      },
    ];

    const loader = createLoader(overrides);
    const result = await loader.loadFromTransactions(txs);

    expect(result.map((t) => t.category)).toEqual(['a', 'u', 'v', 'w', 'c']);
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
