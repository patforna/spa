const ignore = require('./ignore');
const manual = require('./manual');
const rules = require('./rules');

module.exports = row => {
  if (shouldIgnore(row)) row.category = 'ignore';
  else if (manualCategory(row)) row.category = manualCategory(row);
  else categoriseUsingRules(row);

  return row;
};

const shouldIgnore = row => {
  return ignore.some(([date, amount]) => {
    return date.isSame(row.date) && amount === row.amount;
  });
};

const manualCategory = row => {
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
