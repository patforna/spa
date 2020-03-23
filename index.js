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
    describe: 'print result in json instead of table format',
  }).argv;

module.exports = () => {
  const data = fs.readFileSync(options.file, { encoding: ENCODING });
  const rows = filter(csv.parse(data));

  rows.forEach(categorise);
  uncategorised(rows).forEach(r => console.log(asString(r)));

  const summary = new Summary(rows);
  if (options.json) console.log(stringify(summary.data));
  else console.log(table(summary));
};

const filter = rows => {
  return rows
    .filter(r => r.date.year() === 2020) // hack because can't restrict FKB exports by valuta
    .filter(r => r.amount < 0 && r.category !== 'ignore');
};

const uncategorised = rows => {
  return rows.filter(r => r.category === categorise.noCategory);
};

const asString = row => {
  return `${row.date.toISOString()} ${row.description} ${row.amount}`;
};
