import _ from 'lodash';
import moment from 'moment';
import { IGNORE } from './categoriser.js';
import { Item } from './items.js';

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
  items: Item[];
  data: SummaryData;
  constructor(items: Item[]) {
    this.data = {
      months: _.range(12).map(() => ({ categories: {} })),
    };

    this.items = items.filter((item) => item.category !== IGNORE);
    this.items.forEach((item) =>
      add(this.data, `categories.${item.category}`, item)
    );
  }

  get monthNames(): string[] {
    return _.take(moment.monthsShort(), this.data.months.length);
  }

  // all category names - sorted by category total
  get categoryNames(): string[] {
    const categories = _.union<string>(
      this.data.months.flatMap((m) => Object.keys(m.categories))
    );

    return _.sortBy(categories, (c) => this.totalForCategory(c).amount);
  }

  totalsForCategoryByMonth(category: string): Total[] {
    return this.data.months.map((_, i: number) => this.totalFor(i, category));
  }

  avgForCategory(category: string): Total {
    return mean(this.totalsForCategoryByMonth(category));
  }

  totalForCategory(category: string): Total {
    return sum(this.totalsForCategoryByMonth(category));
  }

  percentageForCategory(category: string): number {
    return _.round(
      (100 / this.total().amount) * this.totalForCategory(category).amount
    );
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
    return mean(this.totalsByMonth());
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

function add(data: SummaryData, field: string, item: Item): void {
  const month = item.date.month();

  let obj = _.get(data.months[month], field);
  if (!obj) {
    _.set(data.months[month], field, { amount: 0, transactions: 0 });
    obj = _.get(data.months[month], field);
  }

  obj.amount += Math.round(item.amount);
  obj.transactions += 1;
}
