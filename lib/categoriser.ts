import moment from 'moment';
import { Transaction } from './transactions.js';
import { Rules } from './rules.js';

export const NO_CATEGORY = 'no_category';
export const IGNORE = 'ignore';

export class Categoriser {
  #rules: Rules;
  #overrides: Transaction[];
  constructor(rules: Rules, overrides: Transaction[]) {
    this.#rules = rules;
    this.#overrides = overrides;
  }

  categorise(tx: Transaction): Transaction {
    const override = overriddenTx(this.#overrides, tx);
    if (override?.category) tx.category = override.category;
    else categoriseUsingRules(this.#rules, tx);

    if (!tx.category) tx.category = NO_CATEGORY;

    if (override?.comment) tx.comment = override.comment;

    return tx;
  }
}

function overriddenTx(overrides: Transaction[], tx: Transaction): Transaction {
  const found = overrides.find(({ date, amount }) => {
    return moment(date).isSame(tx.date) && amount === tx.amount;
  });

  return found;
}

function categoriseUsingRules(rules: Rules, tx: Transaction): void {
  Object.entries(rules).forEach((rule) => {
    const [cat, res] = rule;
    res.forEach((re: RegExp) => {
      if (re.test(tx.description)) {
        if (tx.category && tx.category !== cat && cat !== IGNORE)
          throw new Error(
            `Multiple categories found for tx: "${tx.description}" - [${tx.category}, ${cat}]`
          );
        tx.category = cat;
        if (cat === IGNORE) return;
      }
    });
  });
}
