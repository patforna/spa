import moment from 'moment';
import { Card, Item } from '../../lib/items.js';

export const makeItem = (overrides: Partial<Item> = {}): Item => ({
  date: moment(),
  amount: 0,
  description: '',
  category: '',
  comment: '',
  card: Card.Unknown,
  valuta: moment(),
  ...overrides,
});
