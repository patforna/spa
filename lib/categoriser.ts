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

  categorise(item: Item, year: number = undefined): Item {
    if (item.amount < 0 || (year && item.date.year() != year)) {
      item.category = IGNORE;
      return item;
    }

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
    // date is same as valuta is a legacy hack, because in overrides.json some items have been saved with date as valuta
    return (
      (moment(date).isSame(item.date) || moment(date).isSame(item.valuta)) &&
      amount === item.amount
    );
  });

  return found;
}

function categoriseUsingRules(rules: Rules, item: Item): void {
  Object.entries(rules).forEach((rule) => {
    const [cat, res] = rule;
    res.forEach((re: RegExp) => {
      if (item.category === undefined && re.test(item.description))
        item.category = cat;
    });
  });
}
