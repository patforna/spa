const _ = require('lodash');

module.exports = rows => {
  const result = {
    months: [],
  };

  rows = rows
    .filter(r => r.date.year() === 2020) // hack because can't restrict FKB exports by valuta
    .filter(r => r.amount < 0 && r.category !== 'ignore');

  rows.forEach(r => add(result, 'all', r));

  // FIXME
  rows
    .filter(r => r.category === 'no_category')
    .forEach(r =>
      console.log(r.date.toISOString() + ' ' + r.description + ' ' + r.amount)
    );

  rows
    .filter(r => r.category)
    .forEach(r => add(result, `categories.${r.category}`, r));

  return result;
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
