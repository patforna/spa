import dayjs from '../lib/date.js';
import { Card, Override, Transaction } from '../lib/transactions.js';

export const makeTx = (overrides: Partial<Transaction> = {}): Transaction => ({
  date: dayjs().utc(),
  amount: 0,
  description: '',
  category: '',
  comment: '',
  card: Card.Unknown,
  ...overrides,
});

export const makeOverride = (overrides: Partial<Override> = {}): Override => ({
  date: dayjs().utc(),
  amount: 0,
  category: '',
  comment: '',
  ...overrides,
});
