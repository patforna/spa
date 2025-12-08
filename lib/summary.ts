import _ from 'lodash';
import moment from 'moment';
import { Transaction, txsExcludingIgnored } from './transactions.js';

export interface Total {
  amount: number;
  transactions: number;
}

export interface SummaryData {
  months: SummaryMonthData[];
}

export interface SummaryMonthData {
  categories: Record<string, Total>;
}

const ZERO_TOTAL: Total = { amount: 0, transactions: 0 };

export class Summary {
  txs: Transaction[];
  data: SummaryData;
  constructor(txs: Transaction[]) {
    this.data = {
      months: _.range(12).map(() => ({ categories: {} })),
    };

    if (_.uniq(txs.map((tx) => tx.date.year())).length > 1)
      throw new Error('Cannot summarise transactions from multiple years.');

    this.txs = txsExcludingIgnored(txs);
    this.txs.forEach((tx) => add(this.data, `categories.${tx.category}`, tx));
  }

  get monthNames(): string[] {
    return _.take(moment.monthsShort(), this.data.months.length);
  }

  // all category names - sorted alphabetically
  get categoryNames(): string[] {
    const categories = _.union<string>(
      this.data.months.flatMap((m) => Object.keys(m.categories))
    );

    return _.sortBy(categories);
  }

  totalsForCategoryByMonth(category: string): Total[] {
    return this.data.months.map((_, i: number) => this.totalFor(i, category));
  }

  avgForCategory(category: string): Total {
    const totals = this.totalsForCategoryByMonth(category).filter(
      (t) => t.amount !== 0
    );
    return totals.length === 0 ? ZERO_TOTAL : mean(totals);
  }

  totalForCategory(category: string): Total {
    return sum(this.totalsForCategoryByMonth(category));
  }

  percentageForCategory(category: string): number {
    const val =
      (100 / this.total().amount) * this.totalForCategory(category).amount;
    return Math.sign(val) * Math.round(Math.abs(val));
  }

  totalsByMonth(): Total[] {
    return this.data.months.map((_, i: number) => this.totalForMonth(i));
  }

  totalForMonth(month: number): Total {
    return sum(
      this.categoryNames.map((category) => this.totalFor(month, category))
    );
  }

  totalFor(month: number, category: string): Total {
    return _.defaultTo(
      this.data.months[month].categories[category],
      ZERO_TOTAL
    );
  }

  avg(): Total {
    const totals = this.totalsByMonth().filter((t) => t.amount !== 0);
    return totals.length === 0 ? ZERO_TOTAL : mean(totals);
  }

  total(): Total {
    return sum(this.totalsByMonth());
  }
}

function sum(totals: Total[]): Total {
  const amount = _.sumBy(totals, (x) => x.amount);
  const transactions = _.sumBy(totals, (x) => x.transactions);
  return { amount, transactions };
}

function mean(totals: Total[]): Total {
  const amount = _.meanBy(totals, (x) => x.amount);
  const transactions = _.meanBy(totals, (x) => x.transactions);
  return { amount, transactions };
}

function add(data: SummaryData, field: string, tx: Transaction): void {
  const month = tx.date.month();

  let obj = _.get(data.months[month], field);
  if (!obj) {
    _.set(data.months[month], field, { amount: 0, transactions: 0 });
    obj = _.get(data.months[month], field);
  }

  obj.amount += Math.sign(tx.amount) * Math.round(Math.abs(tx.amount));
  obj.transactions += 1;
}
