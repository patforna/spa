import _ from 'lodash';
import { asString, Transaction, txsForCategory } from '../transactions.js';
import { Command } from './index.js';

export class DetailsCommand implements Command {
  #category: string;
  #sortBy: string;
  constructor(sortBy: string, category?: string) {
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

    _.orderBy(txs, this.#sortBy).forEach((tx) =>
      console.log(asString(tx, true))
    );
  }
}
