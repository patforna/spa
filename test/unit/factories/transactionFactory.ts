import dayjs from '../../../lib/date.js';
import { Card, Transaction } from '../../../lib/transactions.js';

export const makeTx = (overrides: Partial<Transaction> = {}): Transaction => ({
  date: dayjs(),
  amount: 0,
  description: '',
  category: '',
  comment: '',
  card: Card.Unknown,
  ...overrides,
});
