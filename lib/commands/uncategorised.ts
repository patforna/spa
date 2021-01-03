import inquirer from 'inquirer';
import _ from 'lodash';
import { NO_CATEGORY } from '../categoriser.js';
import { asString } from '../items.js';
import { Summary } from '../summary';
import { Command } from './index.js';

export class UncategorisedCommand implements Command {
  async execute(summary: Summary): Promise<void> {
    for (const item of summary.itemsForCategory(NO_CATEGORY)) {
      let answers = await inquirer.prompt([
        {
          name: 'category',
          message: `Unable to categorise: "${asString(item)}"\nEnter category:`,
          validate: (input) => _.trim(input) !== '',
        },
      ]);
      console.info('Answer:', answers.category);
    }
  }
}
