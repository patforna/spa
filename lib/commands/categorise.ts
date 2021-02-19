import inquirer from 'inquirer';
import _ from 'lodash';
import { NO_CATEGORY } from '../categoriser.js';
import { asString, Item, itemsForCategory } from '../items.js';
import { categoriser, itemRepo } from '../wiring.js';
import { Command } from './index.js';
import rules from '../rules.js';

inquirer.registerPrompt(
  'autocomplete',
  require('inquirer-autocomplete-prompt')
);

const categories = _.concat(_.sortBy(Object.keys(rules)), 'ignore');

export class CategoriseCommand implements Command {
  async execute(items: Item[]): Promise<void> {
    const year = guessYear(items);
    console.log('Guessing year: ' + year);

    items.forEach((item) => categoriser.categorise(item, year)); // TODO inject

    const uncategorised = itemsForCategory(items, NO_CATEGORY);
    for (const item of uncategorised) {
      const answers = await inquirer.prompt([
        {
          type: 'autocomplete',
          name: 'category',
          message: `Enter category for: ${asString(item)}\n`,
          pageSize: 20,
          source: (_, input: string) => autocompleteCategory(input),
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

// narrow down list of categories or return input when no results found
function autocompleteCategory(input: string) {
  const filtered = _.filter(
    categories,
    (c) => input == undefined || c.startsWith(input.toLowerCase())
  );

  return filtered.length > 0 ? filtered : [input];
}
