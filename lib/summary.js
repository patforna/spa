import lodashPkg from 'lodash';
const { defaultTo, get, meanBy, range, set, sumBy, take, union } = lodashPkg;
import momentPkg from 'moment';
const { monthsShort } = momentPkg;
import categorise, { ignore } from './categorise/index.js';
import { parse } from './csv.js';

export function createFromCSV(data) {
  let items = parse(data);
  items.forEach(categorise);
  items = filter(items);
  return new Summary(items);
}

const filter = (items) => {
  return items
    .filter((r) => r.date.year() === 2020) // hack because can't restrict FKB exports by valuta
    .filter((r) => r.amount < 0 && r.category !== ignore);
};

class Summary {
  constructor(items) {
    const data = {
      months: range(12).map(() => {
        return { all: { amount: 0, transactions: 0 } };
      }),
    };

    items.forEach((item) => add(data, 'all', item));
    items.forEach((item) => add(data, `categories.${item.category}`, item));

    this.data = data;
    this.items = items;
  }

  get monthNames() {
    return take(monthsShort(), this.data.months.length);
  }

  get categoryNames() {
    return union(
      this.data.months.flatMap((m) => Object.keys(m.categories))
    ).sort();
  }

  totalsForCategoryByMonth(category) {
    return this.data.months.map((_, i) => this.totalFor(i, category));
  }

  avgForCategory(category) {
    return mean(this.totalsForCategoryByMonth(category));
  }

  totalForCategory(category) {
    return sum(this.totalsForCategoryByMonth(category));
  }

  totalsByMonth() {
    return this.data.months.map((m) => m.all);
  }

  totalFor(month, category) {
    const deflt = { amount: 0, transactions: 0 };
    return defaultTo(this.data.months[month].categories[category], deflt);
  }

  avg() {
    return mean(this.totalsByMonth());
  }

  total() {
    return sum(this.totalsByMonth());
  }

  itemsForCategory(category) {
    return this.items.filter((item) => item.category === category);
  }
}

const sum = (totals) => {
  const amount = sumBy(totals, (x) => x.amount);
  const transactions = sumBy(totals, (x) => x.transactions);
  return { amount, transactions };
};

const mean = (totals) => {
  const amount = meanBy(totals, (x) => x.amount);
  const transactions = meanBy(totals, (x) => x.transactions);
  return { amount, transactions };
};

const add = (data, field, item) => {
  const month = item.date.month();
  if (!data.months[month]) data.months[month] = {};

  let obj = get(data.months[month], field);
  if (!obj) {
    set(data.months[month], field, { amount: 0, transactions: 0 });
    obj = get(data.months[month], field);
  }

  obj.amount += Math.round(-item.amount);
  obj.transactions += 1;
};
