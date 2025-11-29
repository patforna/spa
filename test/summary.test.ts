import moment from 'moment';
import { Card, Item } from '../lib/items.js';
import { Summary } from '../lib/summary.js';

describe('Summary', () => {
  const createItem = (date: string): Item => ({
    date: moment(date),
    amount: 10,
    description: 'test',
    category: 'test',
    comment: '',
    card: Card.Unknown,
    valuta: moment(date),
  });

  test('should fail if items span multiple years', () => {
    const items = [createItem('2023-01-01'), createItem('2024-01-01')];
    expect(() => new Summary(items)).toThrow(
      'Cannot summarise transactions from multiple years.'
    );
  });

  test('should not fail if items are in the same year', () => {
    const items = [createItem('2023-01-01'), createItem('2023-12-31')];
    expect(() => new Summary(items)).not.toThrow();
  });
});
