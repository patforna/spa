const fs = require('fs');
const yargs = require('yargs');
const stringify = require('json-stringify-pretty-compact');
const categorise = require('./lib/categorise');
const csv = require('./lib/csv');
const table = require('./lib/table');
const Summary = require('./lib/summary');
const path = require('path');

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
  const data = fs.readFileSync(options.file, { encoding: ENCODING });
  let items = csv.parse(data);
  items.forEach(categorise);
  items = filter(items);

  // show items without categories
  category(items, categorise.noCategory).forEach(display);

  if (options.category) category(items, options.category).forEach(display);

  const summary = new Summary(items);
  if (options.json) console.log(stringify(summary.data));

  if (!options.json && !options.category) console.log(table(summary));
};

const filter = (items) => {
  return items
    .filter((r) => r.date.year() === 2020) // hack because can't restrict FKB exports by valuta
    .filter((r) => r.amount < 0 && r.category !== categorise.ignore);
};

const category = (items, category) => {
  return items.filter((r) => r.category === category);
};

const asString = (item) => {
  return `${item.date.format('DD.MM.YYYY')} ${item.description} ${item.amount}`;
};

const display = (item) => {
  console.log(asString(item));
};
