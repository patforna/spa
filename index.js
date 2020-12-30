const fs = require('fs');
const yargs = require('yargs');
const stringify = require('json-stringify-pretty-compact');
const categorise = require('./lib/categorise');
const table = require('./lib/table');
const summaryx = require('./lib/summary');

const ENCODING = 'latin1';

const options = yargs
  .usage('Usage: -f <file>')
  .option('f', {
    alias: 'file',
    type: 'string',
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

module.exports = () => {
  const summary = summaryx.createFromCSV(
    fs.readFileSync(options.file, { encoding: ENCODING })
  );

  // show items without categories
  summary.itemsForCategory(categorise.noCategory).forEach(display);

  // show items for a specific category, if category option has been provided,
  if (options.category) {
    summary.itemsForCategory(options.category).forEach(display);
    return;
  }

  // show summary in json or table format
  console.log(options.json ? stringify(summary.data) : table(summary));
};

const display = (item) => {
  console.log(
    `${item.date.format('DD.MM.YYYY')} ${item.description} ${item.amount}`
  );
};
