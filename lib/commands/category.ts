import { asString } from '../items';
import { Summary } from '../summary';
import { Command } from './index.js';

export class CategoryCommand implements Command {
  #category: string;
  constructor(category: string) {
    this.#category = category;
  }

  async execute(summary: Summary): Promise<void> {
    summary
      .itemsForCategory(this.#category)
      .forEach((item) => console.log(asString(item)));
  }
}
