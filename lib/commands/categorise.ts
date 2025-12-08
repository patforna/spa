import chalk from 'chalk';
import inquirer from 'inquirer';
import inquirerPrompt from 'inquirer-autocomplete-prompt';
import _ from 'lodash';
import { Categoriser, IGNORE, NO_CATEGORY } from '../categoriser.js';
import {
  Transaction,
  OverridesRepo,
  asString,
  txsForCategory,
} from '../transactions.js';
import { RulesRepo } from '../rules.js';
import { Command } from './index.js';

inquirer.registerPrompt('autocomplete', inquirerPrompt);

export class CategoriseCommand implements Command {
  #rulesRepo: RulesRepo;
  #overridesRepo: OverridesRepo;
  #categoriser: Categoriser;

  constructor(
    rulesRepo: RulesRepo,
    overridesRepo: OverridesRepo,
    categoriser: Categoriser
  ) {
    this.#rulesRepo = rulesRepo;
    this.#overridesRepo = overridesRepo;
    this.#categoriser = categoriser;
  }

  async execute(txs: Transaction[]): Promise<void> {
    const rules = this.#rulesRepo.load();
    const categories = _.concat(_.sortBy(Object.keys(rules)), IGNORE);
    txs.forEach((tx) => this.#categoriser.categorise(tx));

    const uncategorised = txsForCategory(txs, NO_CATEGORY);

    // ask user to categorise the ones we couldn't categorise automatically
    const overrides = this.#overridesRepo.load();
    for (const tx of uncategorised) {
      const category = await promptForCategory(categories, tx);
      if (category === 'split') {
        console.log('*** SPLIT MODE ***');
        const splits: Transaction[] = [];
        let remainingAmount = tx.amount;
        while (remainingAmount > 0) {
          const split = {
            amount: await promptForAmount(remainingAmount),
            category: await promptForCategory(categories, tx),
            comment: await promptForComment(),
          } as Transaction;
          splits.push(split);
          remainingAmount -= split.amount;
        }
        overrides.push({
          date: tx.date,
          amount: tx.amount,
          description: tx.description,
          card: tx.card,
          splits,
        } as Transaction);
      } else {
        tx.category = category;
        tx.comment = await promptForComment();
        overrides.push(tx);
      }
    }
    this.#overridesRepo.saveAll(overrides);
  }
}

async function promptForCategory(
  categories: string[],
  tx: Transaction
): Promise<string> {
  const answer = await inquirer.prompt([
    {
      type: 'autocomplete',
      name: 'category',
      message:
        'Enter category for the following transaction (or enter "split"):\n ' +
        chalk.reset.yellow(asString(tx)) +
        '\n',
      pageSize: 20,
      source: (_, input: string) => autocompleteCategory(categories, input),
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

// narrow down list of categories or return input when no results found
function autocompleteCategory(categories: string[], input: string) {
  const filtered = _.filter(
    categories,
    (c) => input == undefined || c.startsWith(input.toLowerCase())
  );

  return filtered.length > 0 ? filtered : [input];
}
