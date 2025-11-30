import moment from 'moment';
import { Summary } from '../lib/summary.js';
import { makeItem } from './factories/itemFactory.js';

describe('Summary', () => {
  test('should fail if items span multiple years', () => {
    const items = [
      makeItem({ date: moment('2023-01-01') }),
      makeItem({ date: moment('2024-01-01') }),
    ];
    expect(() => new Summary(items)).toThrow(
      'Cannot summarise transactions from multiple years.'
    );
  });

  test('should not fail if items are in the same year', () => {
    const items = [
      makeItem({ date: moment('2023-01-01') }),
      makeItem({ date: moment('2023-12-31') }),
    ];
    expect(() => new Summary(items)).not.toThrow();
  });

  test('should ignore months with 0 totals when computing category averages', () => {
    const items = [
      makeItem({ date: moment('2023-01-01'), category: 'CatA', amount: 100 }),
      makeItem({ date: moment('2023-03-01'), category: 'CatA', amount: 200 }),
    ];

    expect(new Summary(items).avgForCategory('CatA').amount).toBe(150);
  });

  test('should ignore months with 0 totals when computing total average', () => {
    const items = [
      makeItem({ date: moment('2023-01-01'), amount: 100 }),
      makeItem({ date: moment('2023-03-01'), amount: 200 }),
    ];
    expect(new Summary(items).avg().amount).toBe(150);
  });
});
