import _ from 'lodash';
import { Output } from '../output.js';
import { asString, Transaction, txsForCategory } from '../transactions.js';
import { Command } from './index.js';

export class DetailsCommand implements Command {
  #category: string;
  #sortBy: string;
  #output: Output;

  constructor(sortBy: string, category: string | undefined, output: Output) {
    this.#sortBy = sortBy;
    this.#category = category;
    this.#output = output;
  }

  async execute(txs: Transaction[]): Promise<void> {
    if (this.#category) txs = txsForCategory(txs, this.#category);

    this.#output.log(
      [
        _.padStart('CATEGORY', 12),
        _.padStart('DATE', 10),
        _.padStart('AMOUNT', 10),
        _.padStart('CARD', 8),
        'DESCRIPTION',
      ].join(' | ')
    );

    _.orderBy(txs, this.#sortBy).forEach((tx) =>
      this.#output.log(asString(tx, true))
    );
  }
}
