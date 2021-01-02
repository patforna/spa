import { readFileSync } from 'fs';
import stringify from 'json-stringify-pretty-compact';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { NO_CATEGORY } from './categorise/index.js';
import { Item } from './items.js';
import { createSummaryFromCSV } from './summary.js';
import { tableFrom } from './table.js';

const ENCODING = 'latin1';

const argv = yargs(hideBin(process.argv))
  .usage('Usage: $0 -f <file>')
  .options({
    f: {
      alias: 'file',
      type: 'string',
      describe: 'the csv file to process',
      demandOption: true,
    },
    c: {
      alias: 'category',
      type: 'string',
      describe: 'display transactions for given category',
    },
    j: {
      alias: 'json',
      type: 'boolean',
      describe: 'display result in json instead of table format',
    },
  }).argv;

export default (): void => {
  const summary = createSummaryFromCSV(
    readFileSync(argv.f, { encoding: ENCODING })
  );

  // show items without categories
  summary.itemsForCategory(NO_CATEGORY).forEach(display);

  // show items for a specific category, if category option has been provided,
  if (argv.c) {
    summary.itemsForCategory(argv.c).forEach(display);
    return;
  }

  // show summary in json or table format
  console.log(argv.j ? stringify(summary.data) : tableFrom(summary));
};

const display = (item: Item): void => {
  console.log(
    `${item.date.format('DD.MM.YYYY')} ${item.description} ${item.amount}`
  );
};
