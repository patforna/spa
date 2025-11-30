import moment from 'moment';
import { Summary } from '../lib/summary.js';
import { makeItem } from './factories/itemFactory.js';

describe('Summary', () => {
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
