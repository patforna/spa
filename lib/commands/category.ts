import { asString, Item, itemsForCategory } from '../items';
import { Command } from './index.js';

export class CategoryCommand implements Command {
  #category: string;
  constructor(category: string) {
    this.#category = category;
  }

  async execute(items: Item[]): Promise<void> {
    itemsForCategory(items, this.#category).forEach((item) =>
      console.log(asString(item))
    );
  }
}
