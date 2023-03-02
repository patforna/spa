import moment from 'moment';
import { Item } from './items.js';
import rules from './rules.js';

export const NO_CATEGORY = 'no_category';
export const IGNORE = 'ignore';

export class Categoriser {
  #overrides: Item[];
  constructor(overrides: Item[]) {
    this.#overrides = overrides;
  }

  categorise(item: Item, year: number = undefined): Item {
    if (item.amount > 0 || (year && item.date.year() != year)) {
      item.category = IGNORE;
      return item;
    }

    let oItem = overriddenItem(this.#overrides, item);
    if (oItem?.category) item.category = oItem.category;
    else categoriseUsingRules(item);

    if (!item.category) item.category = NO_CATEGORY;

    if (oItem?.comment) item.comment = oItem.comment;

    return item;
  }
}

function overriddenItem(overrides: Item[], item: Item): Item {
  const found = overrides.find(({ date, amount }) => {
    return moment(date).isSame(item.date) && amount === item.amount;
  });

  return found;
}

function categoriseUsingRules(item: Item): void {
  Object.entries(rules).forEach((rule) => {
    const [cat, res] = rule;
    res.forEach((re: RegExp) => {
      if (item.category === undefined && re.test(item.description))
        item.category = cat;
    });
  });
}
