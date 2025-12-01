import moment from 'moment';
import { Item } from './items.js';
import { Rules } from './rules.js';

export const NO_CATEGORY = 'no_category';
export const IGNORE = 'ignore';

export class Categoriser {
  #rules: Rules;
  #overrides: Item[];
  constructor(rules: Rules, overrides: Item[]) {
    this.#rules = rules;
    this.#overrides = overrides;
  }

  categorise(item: Item): Item {
    const oItem = overriddenItem(this.#overrides, item);
    if (oItem?.category) item.category = oItem.category;
    else categoriseUsingRules(this.#rules, item);

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

function categoriseUsingRules(rules: Rules, item: Item): void {
  Object.entries(rules).forEach((rule) => {
    const [cat, res] = rule;
    res.forEach((re: RegExp) => {
      if (re.test(item.description)) {
        if (item.category && item.category !== cat && cat !== IGNORE)
          throw new Error(
            `Multiple categories found for item: "${item.description}" - [${item.category}, ${cat}]`
          );
        item.category = cat;
        if (cat === IGNORE) return;
      }
    });
  });
}
