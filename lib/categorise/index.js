const ignore = require('./ignore');
const manual = require('./manual');
const rules = require('./rules');

const NO_CATEGORY = 'no_category';

module.exports = row => {
  if (shouldIgnore(row)) row.category = 'ignore';
  else if (categoriseManually(row)) row.category = categoriseManually(row);
  else categoriseUsingRules(row);

  if (!row.category) row.category = NO_CATEGORY;

  return row;
};

const shouldIgnore = row => {
  return ignore.some(([date, amount]) => {
    return date.isSame(row.date) && amount === row.amount;
  });
};

const categoriseManually = row => {
  const item = manual.find(([date, amount]) => {
    return date.isSame(row.date) && amount === row.amount;
  });

  return item ? item[2] : undefined;
};

const categoriseUsingRules = row => {
  Object.keys(rules).forEach(category => {
    rules[category].forEach(regExp => {
      if (row.category === undefined && regExp.test(row.description))
        row.category = category;
    });
  });
};

module.exports.noCategory = NO_CATEGORY;
