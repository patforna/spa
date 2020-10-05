const _ = require('lodash');
const moment = require('moment');

module.exports = class Summary {
  constructor(rows) {
    const data = {
      months: [],
    };

    rows.forEach((r) => add(data, 'all', r));
    rows.forEach((r) => add(data, `categories.${r.category}`, r));

    this.data = data;
  }

  get monthNames() {
    return _.take(moment.monthsShort(), this.data.months.length);
  }

  get categoryNames() {
    return _.union(
      this.data.months.flatMap((m) => Object.keys(m.categories))
    ).sort();
  }

  byMonth() {
    return this.data.months.map((m) => m.all);
  }

  forCategoryByMonth(category) {
    return this.data.months.map((_, i) => this.for(i, category));
  }

  forCategory(category) {
    return sum(this.forCategoryByMonth(category));
  }

  for(month, category) {
    const deflt = { amount: 0, transactions: 0 };
    return _.defaultTo(this.data.months[month].categories[category], deflt);
  }

  total() {
    return sum(this.byMonth());
  }

  avgForCategory(category) {
    return mean(this.forCategoryByMonth(category));
  }

  avg() {
    return mean(this.byMonth());
  }
};

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

const add = (data, field, row) => {
  const month = row.date.month();
  if (!data.months[month]) data.months[month] = {};

  let obj = _.get(data.months[month], field);
  if (!obj) {
    _.set(data.months[month], field, { amount: 0, transactions: 0 });
    obj = _.get(data.months[month], field);
  }

  obj.amount += Math.round(-row.amount);
  obj.transactions += 1;
};
