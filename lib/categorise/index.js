import moment from 'moment';
import { loadIgnore, loadManual } from '../items.js';
import rules from './rules.js';

const NO_CATEGORY = 'no_category';
const IGNORE = 'ignore';

const ignore = loadIgnore();
const manual = loadManual();

export default (item) => {
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

export const noCategory = NO_CATEGORY;
const _ignore = IGNORE;
export { _ignore as ignore };
