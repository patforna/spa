const fs = require('fs');
const yargs = require('yargs');
const stringify = require('json-stringify-pretty-compact');
const categorise = require('./lib/categorise');
const csv = require('./lib/csv');
const table = require('./lib/table');
const summarise = require('./lib/summary');

const ENCODING = 'latin1';

module.exports = () => {
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

  const data = fs.readFileSync(options.file, { encoding: ENCODING });
  const rows = csv.parse(data);
  rows.forEach(categorise);
  const summary = summarise(rows);

  if (options.json) console.log(stringify(summary));
  else console.log(table(summary));
};
