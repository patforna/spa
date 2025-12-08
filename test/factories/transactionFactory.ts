import moment from 'moment';
import { Card, Transaction } from '../../lib/transactions.js';

export const makeTx = (overrides: Partial<Transaction> = {}): Transaction => ({
  date: moment(),
  amount: 0,
  description: '',
  category: '',
  comment: '',
  card: Card.Unknown,
  ...overrides,
});
