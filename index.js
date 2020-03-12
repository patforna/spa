const fs = require('fs');
const yargs = require('yargs');
const categorise = require('./lib/categorise');
const csv = require('./lib/csv');

const ENCODING = 'latin1';

module.exports = () => {
  const options = yargs.usage('Usage: -f <file>').option('f', {
    alias: 'file',
    type: 'string',
    demandOption: true,
  }).argv;

  const data = fs.readFileSync(options.file, { encoding: ENCODING });
  const rows = csv.parse(data);
  rows.forEach(categorise);

  // console.log(rows.splice(0, 5));

  const summary = summarise(rows);

  console.log(summary);
};

const summarise = rows => {
  const result = {
    all: { transactions: 0, total: 0 },
    not_categorised: { transactions: 0, total: 0 },
  };

  rows
    .filter(row => row.amount < 0 && row.category !== 'ignore')
    .forEach(row => {
      result.all.transactions += 1;
      result.all.total += Math.round(row.amount);

      if (row.category == undefined) {
        result.not_categorised.transactions += 1;
        result.not_categorised.total += Math.round(row.amount);
        console.log(
          'NO CAT: ' + row.date + ' ' + row.description + ' ' + row.amount
        );
      } else {
        if (result[row.category] == undefined)
          result[row.category] = { transactions: 0, total: 0 };

        result[row.category].transactions += 1;
        result[row.category].total += Math.round(row.amount);
      }

      // console.log(row.amount + ' ' + row.description);
      // console.log(result.all.total);
    });

  // const result = {
  //   all: { transactions: 42, total: 2233 },
  //   groceries: { transactions: 42, total: 2233 },
  //   not_categorised: { transactions: 42, total: 2233 },
  // };

  return result;
};
