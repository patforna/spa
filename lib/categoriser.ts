import moment from 'moment';
import { Item } from './items';
import rules from './rules';

export const NO_CATEGORY = 'no_category';
export const IGNORE = 'ignore';

export class Categoriser {
  #overrides: Item[];
  constructor(overrides: Item[]) {
    this.#overrides = overrides;
  }

  categorise(item: Item): Item {
    if (item.amount > 0) {
      item.category = IGNORE;
      return item;
    }

    let category = overriddenCategory(this.#overrides, item);
    if (category) item.category = category;
    else categoriseUsingRules(item);

    if (!item.category) item.category = NO_CATEGORY;

    return item;
  }
}

function overriddenCategory(overrides: Item[], item: Item): string {
  const found = overrides.find(({ date, amount }) => {
    return moment(date).isSame(item.date) && amount === item.amount;
  });

  return found ? found.category : undefined;
}

function categoriseUsingRules(item: Item): void {
  Object.keys(rules).forEach((category) => {
    rules[category].forEach((regExp) => {
      if (item.category === undefined && regExp.test(item.description))
        item.category = category;
    });
  });
}
