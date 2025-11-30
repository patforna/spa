import moment from 'moment';
import { Card, Item } from '../lib/items.js';
import { Summary } from '../lib/summary.js';

describe('Summary', () => {
  const createItem = (
    date: string,
    category: string,
    amount: number
  ): Item => ({
    date: moment(date),
    amount,
    description: 'test',
    category,
    comment: '',
    card: Card.Unknown,
    valuta: moment(date),
  });

  test('should ignore months with 0 totals when computing category averages', () => {
    const items = [
      createItem('2023-01-01', 'CatA', 100),
      createItem('2023-03-01', 'CatA', 200),
    ];

    expect(new Summary(items).avgForCategory('CatA').amount).toBe(150);
  });

  test('should ignore months with 0 totals when computing total average', () => {
    const items = [
      createItem('2023-01-01', 'CatA', 100),
      createItem('2023-03-01', 'CatB', 200),
    ];
    expect(new Summary(items).avg().amount).toBe(150);
  });
});
