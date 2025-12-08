import { Transaction, findOverride } from './transactions.js';
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
    // Skip if already categorised (e.g., from split expansion)
    if (tx.category) return tx;

    const override = findOverride(this.#overrides, tx);
    if (override) {
      tx.category = override.category;
      tx.comment = override.comment;
    } else categoriseUsingRules(this.#rules, tx);

    if (!tx.category) tx.category = NO_CATEGORY;
    return tx;
  }
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
