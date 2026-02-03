import chalk from 'chalk';
import inquirer from 'inquirer';
import inquirerPrompt from 'inquirer-autocomplete-prompt';
import _ from 'lodash';
import { Categoriser, IGNORE, NO_CATEGORY } from '../categoriser.js';
import { Output } from '../output.js';
import {
  Transaction,
  OverridesRepo,
  asString,
  txsForCategory,
  Override,
  OverrideSplit,
} from '../transactions.js';
import { Rules } from '../rules.js';
import { Command } from './index.js';

inquirer.registerPrompt('autocomplete', inquirerPrompt);

export interface Prompter {
  promptForCategory(categories: string[], tx: Transaction): Promise<string>;
  promptForAmount(remaining: number): Promise<number>;
  promptForComment(): Promise<string | undefined>;
}

export class CategoriseCommand implements Command {
  #rules: Rules;
  #overrides: Override[];
  #overridesRepo: OverridesRepo;
  #categoriser: Categoriser;
  #prompter: Prompter;
  #nonInteractive: boolean;
  #output?: Output;

  constructor(
    rules: Rules,
    overrides: Override[],
    overridesRepo: OverridesRepo,
    categoriser: Categoriser,
    prompter: Prompter = defaultPrompter,
    nonInteractive: boolean = false,
    output?: Output
  ) {
    this.#rules = rules;
    this.#overrides = overrides;
    this.#overridesRepo = overridesRepo;
    this.#categoriser = categoriser;
    this.#prompter = prompter;
    this.#nonInteractive = nonInteractive;
    this.#output = output;
  }

  async execute(txs: Transaction[]): Promise<void> {
    const categories = [..._.sortBy(Object.keys(this.#rules)), IGNORE];
    txs.forEach((tx) => this.#categoriser.categorise(tx));

    const uncategorised = txsForCategory(txs, NO_CATEGORY);

    // In non-interactive mode, simply output uncategorised txs as JSON
    // instead of prompting the user to categorise them.
    if (this.#nonInteractive) {
      if (uncategorised.length > 0 && this.#output) {
        const output = {
          uncategorised: uncategorised.map((tx) => ({
            date: tx.date.toISOString(),
            amount: tx.amount,
            description: tx.description,
          })),
        };
        this.#output.log(JSON.stringify(output));
      }
      return;
    }

    // ask user to categorise the ones we couldn't categorise automatically
    for (const tx of uncategorised) {
      const category = await this.#prompter.promptForCategory(categories, tx);
      if (category === 'split') {
        console.log('*** SPLIT MODE ***');
        const splits: OverrideSplit[] = [];
        const sign = tx.amount < 0 ? -1 : 1;
        let remainingAmount = Math.abs(tx.amount);
        while (remainingAmount > 0) {
          const splitAmount =
            await this.#prompter.promptForAmount(remainingAmount);
          const split = {
            amount: sign * splitAmount,
            category: await this.#prompter.promptForCategory(categories, tx),
            comment: await this.#prompter.promptForComment(),
          } as OverrideSplit;
          splits.push(split);
          remainingAmount -= splitAmount;
        }
        this.#overrides.push({
          date: tx.date,
          amount: tx.amount,
          description: tx.description,
          category: '',
          comment: '',
          splits,
        } as Override);
      } else {
        tx.category = category;
        tx.comment = await this.#prompter.promptForComment();
        this.#overrides.push({
          date: tx.date,
          amount: tx.amount,
          description: tx.description,
          category: tx.category,
          comment: tx.comment,
        } as Override);
      }
    }
    this.#overridesRepo.saveAll(this.#overrides);
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
        if (input.trim() === '')
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
  const filtered = categories.filter(
    (c) => input == undefined || c.startsWith(input.toLowerCase())
  );

  return filtered.length > 0 ? filtered : [input];
}

export const defaultPrompter: Prompter = {
  promptForCategory,
  promptForAmount,
  promptForComment,
};
