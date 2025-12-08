import moment from 'moment';
import { Summary } from '../lib/summary.js';
import { makeTx } from './factories/transactionFactory.js';

describe('Summary', () => {
  test('should fail if txs span multiple years', () => {
    const txs = [
      makeTx({ date: moment('2023-01-01') }),
      makeTx({ date: moment('2024-01-01') }),
    ];
    expect(() => new Summary(txs)).toThrow(
      'Cannot summarise transactions from multiple years.'
    );
  });

  test('should not fail if txs are in the same year', () => {
    const txs = [
      makeTx({ date: moment('2023-01-01') }),
      makeTx({ date: moment('2023-12-31') }),
    ];
    expect(() => new Summary(txs)).not.toThrow();
  });

  test('should ignore months with 0 totals when computing category averages', () => {
    const txs = [
      makeTx({ date: moment('2023-01-01'), category: 'CatA', amount: 100 }),
      makeTx({ date: moment('2023-03-01'), category: 'CatA', amount: 200 }),
    ];

    expect(new Summary(txs).avgForCategory('CatA').amount).toBe(150);
  });

  test('should ignore months with 0 totals when computing total average', () => {
    const txs = [
      makeTx({ date: moment('2023-01-01'), amount: 100 }),
      makeTx({ date: moment('2023-03-01'), amount: 200 }),
    ];
    expect(new Summary(txs).avg().amount).toBe(150);
  });
});
