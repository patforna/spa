import inquirer from 'inquirer';
import _ from 'lodash';
import { NO_CATEGORY } from '../categoriser.js';
import { asString, Item, itemsForCategory } from '../items.js';
import { categoriser, itemRepo } from '../wiring.js';
import { Command } from './index.js';

export class CategoriseCommand implements Command {
  async execute(items: Item[]): Promise<void> {
    items.forEach((item) => categoriser.categorise(item)); // TODO inject

    const uncategorised = itemsForCategory(items, NO_CATEGORY);
    for (const item of uncategorised) {
      const answers = await inquirer.prompt([
        {
          name: 'category',
          message: `Unable to categorise: "${asString(item)}"\nEnter category:`,
          validate: (input) => _.trim(input) !== '',
        },
      ]);
      itemRepo.save(item); // TODO inject
    }

    uncategorised.forEach((item) => categoriser.categorise(item));
  }
}
