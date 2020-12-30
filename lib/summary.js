const _ = require('lodash');
const moment = require('moment');
const csv = require('./csv');
const categorise = require('./categorise');

module.exports.createFromCSV = (data) => {
  let items = csv.parse(data);
  items.forEach(categorise);
  items = filter(items);
  return new Summary(items);
};

const filter = (items) => {
  return items
    .filter((r) => r.date.year() === 2020) // hack because can't restrict FKB exports by valuta
    .filter((r) => r.amount < 0 && r.category !== categorise.ignore);
};

class Summary {
  constructor(items) {
    const data = {
      months: [],
    };

    items.forEach((item) => add(data, 'all', item));
    items.forEach((item) => add(data, `categories.${item.category}`, item));

    this.data = data;
    this.items = items;
  }

  get monthNames() {
    return _.take(moment.monthsShort(), this.data.months.length);
  }

  get categoryNames() {
    return _.union(
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
    return _.defaultTo(this.data.months[month].categories[category], deflt);
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

const sum = (items) => {
  const amount = _.sumBy(items, (x) => x.amount);
  const transactions = _.sumBy(items, (x) => x.transactions);
  return { amount, transactions };
};

const mean = (items) => {
  const amount = _.meanBy(items, (x) => x.amount);
  const transactions = _.meanBy(items, (x) => x.transactions);
  return { amount, transactions };
};

const add = (data, field, item) => {
  const month = item.date.month();
  if (!data.months[month]) data.months[month] = {};

  let obj = _.get(data.months[month], field);
  if (!obj) {
    _.set(data.months[month], field, { amount: 0, transactions: 0 });
    obj = _.get(data.months[month], field);
  }

  obj.amount += Math.round(-item.amount);
  obj.transactions += 1;
};
