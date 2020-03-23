const _ = require('lodash');
const moment = require('moment');

module.exports = class Summary {
  constructor(rows) {
    const data = {
      months: [],
    };

    rows.forEach(r => add(data, 'all', r));
    rows.forEach(r => add(data, `categories.${r.category}`, r));

    this.data = data;
  }

  get monthNames() {
    return _.take(moment.monthsShort(), this.data.months.length);
  }

  get categoryNames() {
    return _.union(
      this.data.months.flatMap(m => Object.keys(m.categories))
    ).sort();
  }

  byMonth() {
    return this.data.months.map(m => m.all);
  }

  forCategoryByMonth(category) {
    return this.data.months.map((_, i) => this.for(i, category));
  }

  forCategory(category) {
    return sum(this.forCategoryByMonth(category));
  }

  for(month, category) {
    const deflt = { total: 0, transactions: 0 };
    return _.defaultTo(this.data.months[month].categories[category], deflt);
  }
};

const sum = items => {
  const total = _.sum(items.map(x => x.total));
  const transactions = _.sum(items.map(x => x.transactions));
  return { total, transactions };
};

const add = (result, field, row) => {
  const month = row.date.month();
  if (!result.months[month]) result.months[month] = {};

  let obj = _.get(result.months[month], field);
  if (!obj) {
    _.set(result.months[month], field, { transactions: 0, total: 0 });
    obj = _.get(result.months[month], field);
  }

  obj.transactions += 1;
  obj.total += Math.round(-row.amount);
};

module.exports.sum = sum;
