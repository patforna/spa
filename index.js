const fs = require('fs');
const yargs = require('yargs');
const stringify = require('json-stringify-pretty-compact');
const categorise = require('./lib/categorise');
const csv = require('./lib/csv');
const table = require('./lib/table');
const Summary = require('./lib/summary');

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
  let rows = csv.parse(data);
  rows.forEach(categorise);
  rows = filter(rows);

  // show items without categories
  category(rows, categorise.noCategory).forEach(display);

  if (options.category) category(rows, options.category).forEach(display);

  const summary = new Summary(rows);
  if (options.json) console.log(stringify(summary.data));

  if (!options.json && !options.category) console.log(table(summary));
};

const filter = (rows) => {
  return rows
    .filter((r) => r.date.year() === 2020) // hack because can't restrict FKB exports by valuta
    .filter((r) => r.amount < 0 && r.category !== 'ignore');
};

const category = (rows, category) => {
  return rows.filter((r) => r.category === category);
};

const asString = (row) => {
  return `${row.date.format('DD/MM/YYYY')} ${row.description} ${row.amount}`;
};

const display = (row) => {
  console.log(asString(row));
};
