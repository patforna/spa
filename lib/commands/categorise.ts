import chalk from 'chalk';
import inquirer from 'inquirer';
import inquirerPrompt from 'inquirer-autocomplete-prompt';
import _ from 'lodash';
import { Categoriser, IGNORE, NO_CATEGORY } from '../categoriser.js';
import { Item, ItemRepo, asString, itemsForCategory } from '../items.js';
import rules from '../rules.js';
import { Command } from './index.js';

inquirer.registerPrompt('autocomplete', inquirerPrompt);

const categories = _.concat(_.sortBy(Object.keys(rules)), 'ignore');

export class CategoriseCommand implements Command {
  #overridesRepo: ItemRepo;
  #categoriser: Categoriser;

  constructor(overridesRepo: ItemRepo, categoriser: Categoriser) {
    this.#overridesRepo = overridesRepo;
    this.#categoriser = categoriser;
  }

  async execute(items: Item[]): Promise<void> {
    const year = guessYear(items);
    console.log('Guessed year:', year);
    items.forEach((item) => this.#categoriser.categorise(item, year));

    const uncategorised = itemsForCategory(items, NO_CATEGORY);

    // ask user to categorise the ones we couldn't categorise automatically
    for (const item of uncategorised) {
      const category = await promptForCategory(item);
      if (category === 'split') {
        console.log('*** SPLIT MODE ***');
        const splitItems = [];
        let remainingAmount = item.amount;
        while (remainingAmount > 0) {
          const itemCopy = _.cloneDeep(item);
          itemCopy.amount = await promptForAmount(remainingAmount);
          itemCopy.category = await promptForCategory(item);
          itemCopy.comment = await promptForComment();
          splitItems.push(itemCopy);
          remainingAmount -= itemCopy.amount;
        }
        item.category = IGNORE;
        item.comment = 'split';
        this.#overridesRepo.save(item);
        splitItems.forEach((it) => this.#overridesRepo.save(it));
      } else {
        item.category = category;
        item.comment = await promptForComment();
        this.#overridesRepo.save(item);
      }
    }

    // re-run categoriser
    // FIXME shouldn't this be outside of loop?
    uncategorised.forEach((item) => this.#categoriser.categorise(item, year));
  }
}

async function promptForCategory(item: Item): Promise<string> {
  const answer = await inquirer.prompt([
    {
      type: 'autocomplete',
      name: 'category',
      message:
        'Enter category for the following item (or enter "split"):\n ' +
        chalk.reset.yellow(asString(item)) +
        '\n',
      pageSize: 20,
      source: (_, input: string) => autocompleteCategory(input),
      validate: (input) => {
        if (_.trim(input) === '')
          throw new Error('Please provide a category name.');
        return true;
      },
    },
  ]);

  return answer.category;
}

async function promptForAmount(remaining: number): Promise<number> {
  const answer = await inquirer.prompt([
    {
      name: 'amount',
      type: 'number',
      message: 'Enter the amount to split:',
      default: remaining,
      validate: (input: number) => {
        if (input > remaining)
          throw new Error('Amount must not exceeds remaining amount.');
        return true;
      },
    },
  ]);

  return answer.amount;
}

async function promptForComment(): Promise<string> {
  const answer = await inquirer.prompt([
    {
      name: 'comment',
      message: 'Enter comment (optional):',
    },
  ]);
  return answer.comment !== '' ? answer.comment : undefined;
}

function guessYear(items: Item[]): number {
  if (!items?.length) {
    return new Date().getFullYear();
  }
  const m = _.groupBy(items, (it) => it.date.year());
  return Number(_.sortBy(Object.entries(m), ([_, v]) => -v.length)[0][0]);
}

// narrow down list of categories or return input when no results found
function autocompleteCategory(input: string) {
  const filtered = _.filter(
    categories,
    (c) => input == undefined || c.startsWith(input.toLowerCase())
  );

  return filtered.length > 0 ? filtered : [input];
}
