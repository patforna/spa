import _ from 'lodash';
import {
  asString,
  Item,
  itemsForCategory,
  shortDescription,
} from '../items.js';
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
  [SortBy.Description]: [[(i: Item) => shortDescription(i)]],
};

export class DetailsCommand implements Command {
  #category: string;
  #sortBy: SortBy;
  // pass category === '*' to list all categories (excl. ignored)
  constructor(sortBy = SortBy.Date, category: string = undefined) {
    this.#sortBy = sortBy;
    this.#category = category;
  }

  async execute(items: Item[]): Promise<void> {
    if (this.#category) items = itemsForCategory(items, this.#category);

    _.orderBy(items, ...map[this.#sortBy]).forEach((item) =>
      console.log(asString(item, true))
    );
  }
}
