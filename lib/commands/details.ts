import _ from 'lodash';
import {
  asString,
  Transaction,
  txsForCategory,
  shortDescription,
} from '../transactions.js';
import { Command } from './index.js';

export enum SortBy {
  Amount = 1,
  Card = 2,
  Category = 3,
  Comment = 4,
  Date = 5,
  Description = 6,
}

const map = {
  [SortBy.Amount]: [['amount']],
  [SortBy.Card]: [['card']],
  [SortBy.Category]: [['category']],
  [SortBy.Comment]: [['comment']],
  [SortBy.Date]: [['date'], ['desc']],
  [SortBy.Description]: [[(tx: Transaction) => shortDescription(tx)]],
};

export class DetailsCommand implements Command {
  #category: string;
  #sortBy: SortBy;
  // pass category === '*' to list all categories (excl. ignored)
  constructor(sortBy = SortBy.Date, category: string = undefined) {
    this.#sortBy = sortBy;
    this.#category = category;
  }

  async execute(txs: Transaction[]): Promise<void> {
    if (this.#category) txs = txsForCategory(txs, this.#category);

    console.log(
      [
        _.padStart('CATEGORY', 12),
        _.padStart('DATE', 10),
        _.padStart('AMOUNT', 10),
        _.padStart('CARD', 8),
        'DESCRIPTION',
      ].join(' | ')
    );

    _.orderBy(txs, ...map[this.#sortBy]).forEach((tx) =>
      console.log(asString(tx, true))
    );
  }
}
