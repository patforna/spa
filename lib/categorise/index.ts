import moment from 'moment';
import { Item, loadIgnore, loadManual } from '../items';
import rules from './rules';

export const NO_CATEGORY = 'no_category';
export const IGNORE = 'ignore';

const ignore = loadIgnore();
const manual = loadManual();

export function categorise(item: Item): Item {
  if (shouldIgnore(item)) item.category = IGNORE;
  else {
    let category = manualCategory(item);
    if (category) item.category = category;
    else categoriseUsingRules(item);
  }

  if (!item.category) item.category = NO_CATEGORY;

  return item;
}

const shouldIgnore = (item: Item): boolean => {
  return ignore.some(({ date, amount }) => {
    return moment(date).isSame(item.date) && amount === item.amount;
  });
};

const manualCategory = (item: Item): string => {
  const found = manual.find(({ date, amount }) => {
    return moment(date).isSame(item.date) && amount === item.amount;
  });

  return found ? found.category : undefined;
};

const categoriseUsingRules = (item: Item): void => {
  Object.keys(rules).forEach((category) => {
    rules[category].forEach((regExp) => {
      if (item.category === undefined && regExp.test(item.description))
        item.category = category;
    });
  });
};
