import inquirer from 'inquirer';
import _ from 'lodash';
import { NO_CATEGORY } from '../categoriser.js';
import { asString, Item, itemsForCategory } from '../items.js';
import { categoriser, itemRepo } from '../wiring.js';
import { Command } from './index.js';

export class CategoriseCommand implements Command {
  async execute(items: Item[]): Promise<void> {
    const year = guessYear(items);
    console.log('Guessing year: ' + year);

    items.forEach((item) => categoriser.categorise(item, year)); // TODO inject

    const uncategorised = itemsForCategory(items, NO_CATEGORY);
    for (const item of uncategorised) {
      const answers = await inquirer.prompt([
        {
          name: 'category',
          message: `Unable to categorise: ${asString(item)}\nEnter category:`,
          validate: (input) => _.trim(input) !== '',
        },
        {
          name: 'comment',
          message: `Enter comment (optional):`,
        },
      ]);
      item.category = answers.category;
      if (answers.comment != '') item.comment = answers.comment;
      itemRepo.save(item); // TODO inject
    }

    uncategorised.forEach((item) => categoriser.categorise(item, year));
  }
}

function guessYear(items: Item[]) {
  const m = _.groupBy(items, (it) => it.date.year());
  return Number(_.sortBy(Object.entries(m), ([k, v]) => -v.length)[0][0]);
}
