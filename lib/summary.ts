import _ from 'lodash';
import moment from 'moment';
import { Categoriser, IGNORE } from './categoriser';
import { parse } from './csv';
import { Item } from './items';

export function createSummaryFromCSV(
  data: string,
  categoriser: Categoriser
): Summary {
  let items = parse(data);
  items.forEach((i) => categoriser.categorise(i));
  return new Summary(filter(items));
}

const filter = (items: Item[]): Item[] =>
  items
    .filter((item) => item.date.year() === 2020) // hack because can't restrict FKB exports by valuta
    .filter((item) => item.amount < 0 && item.category !== IGNORE);

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
  data: SummaryData;
  items: Item[];
  constructor(items: Item[]) {
    const data = {
      months: _.range(12).map(() => ({ categories: {} })),
    };

    items.forEach((item) => add(data, `categories.${item.category}`, item));

    this.data = data;
    this.items = items;
  }

  get monthNames(): string[] {
    return _.take(moment.monthsShort(), this.data.months.length);
  }

  get categoryNames(): string[] {
    return _.union<string>(
      this.data.months.flatMap((m) => Object.keys(m.categories))
    ).sort();
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

  itemsForCategory(category: string): Item[] {
    return this.items.filter((item) => item.category === category);
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

function add(data: any, field: string, item: Item): void {
  const month = item.date.month();

  let obj = _.get(data.months[month], field);
  if (!obj) {
    _.set(data.months[month], field, { amount: 0, transactions: 0 });
    obj = _.get(data.months[month], field);
  }

  obj.amount += Math.round(-item.amount);
  obj.transactions += 1;
}
