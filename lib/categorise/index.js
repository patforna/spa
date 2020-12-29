const moment = require('moment');
const itemRepo = require('../items');
const rules = require('./rules');

const NO_CATEGORY = 'no_category';
const IGNORE = 'ignore';

const ignore = itemRepo.loadIgnore();
const manual = itemRepo.loadManual();

module.exports = (item) => {
  if (shouldIgnore(item)) item.category = IGNORE;
  else {
    let category = manualCategory(item);
    if (category) item.category = category;
    else categoriseUsingRules(item);
  }

  if (!item.category) item.category = NO_CATEGORY;

  return item;
};

const shouldIgnore = (item) => {
  return ignore.some(({ date, amount }) => {
    return moment(date).isSame(item.date) && amount === item.amount;
  });
};

const manualCategory = (item) => {
  const found = manual.find(({ date, amount }) => {
    return moment(date).isSame(item.date) && amount === item.amount;
  });

  return found ? found.category : undefined;
};

const categoriseUsingRules = (item) => {
  Object.keys(rules).forEach((category) => {
    rules[category].forEach((regExp) => {
      if (item.category === undefined && regExp.test(item.description))
        item.category = category;
    });
  });
};

module.exports.noCategory = NO_CATEGORY;
module.exports.ignore = IGNORE;
