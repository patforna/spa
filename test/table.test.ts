import moment from 'moment';
import { Card, Item } from '../lib/items.js';
import { Summary } from '../lib/summary.js';
import { tableData } from '../lib/table.js';

describe('tableData', () => {
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

  test('should return data with categories sorted alphabetically by default', () => {
    const items = [
      createItem('2023-01-01', 'CatB', 10),
      createItem('2023-01-01', 'CatA', 20),
    ];
    const data = tableData(new Summary(items), 'category');

    // Row 0 is header
    expect(data[1][0]).toContain('CatA');
    expect(data[2][0]).toContain('CatB');
  });

  test('should return data with categories sorted by amount descending if requested', () => {
    const items = [
      createItem('2023-01-01', 'CatB', 10),
      createItem('2023-01-01', 'CatA', 20),
    ];
    const data = tableData(new Summary(items), 'amount');

    expect(data[1][0]).toContain('CatA');
    expect(data[2][0]).toContain('CatB');
  });
});
