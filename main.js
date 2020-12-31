import { readFileSync } from 'fs';
import stringify from 'json-stringify-pretty-compact';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { noCategory } from './lib/categorise/index.js';
import { createFromCSV } from './lib/summary.js';
import table from './lib/table.js';

const ENCODING = 'latin1';

const argv = yargs(hideBin(process.argv))
  .usage('Usage: $0 -f <file>')
  .option('f', {
    alias: 'file',
    type: 'string',
    describe: 'the csv file to process',
    demandOption: true,
  })
  .option('j', {
    alias: 'json',
    type: 'boolean',
    describe: 'display result in json instead of table format',
  })
  .option('c', {
    alias: 'category',
    type: 'string',
    describe: 'display transactions for given category',
  }).argv;

export default () => {
  const summary = createFromCSV(
    readFileSync(argv.file, { encoding: ENCODING })
  );

  // show items without categories
  summary.itemsForCategory(noCategory).forEach(display);

  // show items for a specific category, if category option has been provided,
  if (argv.category) {
    summary.itemsForCategory(argv.category).forEach(display);
    return;
  }

  // show summary in json or table format
  console.log(argv.json ? stringify(summary.data) : table(summary));
};

const display = (item) => {
  console.log(
    `${item.date.format('DD.MM.YYYY')} ${item.description} ${item.amount}`
  );
};
