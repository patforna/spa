import _ from 'lodash';
import { asString, Item, itemsForCategory } from '../items.js';
import { Command } from './index.js';

export enum SortBy {
  Date = 1,
  Amount = 2,
}

const map = {
  [SortBy.Date]: [['date'], ['desc']],
  [SortBy.Amount]: [['amount'], ['asc']],
};

export class CategoryCommand implements Command {
  #category: string;
  #orderBy: SortBy;
  // pass category === '*' to list all categories
  constructor(category: string, sortBy = SortBy.Date) {
    this.#category = category;
    this.#orderBy = sortBy;
  }

  async execute(items: Item[]): Promise<void> {
    let showCategory = true;
    if (this.#category !== '*') {
      showCategory = false;
      items = itemsForCategory(items, this.#category);
    }

    _.orderBy(items, ...map[this.#orderBy]).forEach((item) =>
      console.log(asString(item, showCategory))
    );
  }
}
