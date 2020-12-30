const autoParse = require('auto-parse');
const moment = require('moment');

const FIRST_ROW_NUMBER = 12;
const COLS = ['description', 'amount', 'date'];
const DATE_FORMAT = 'DD.MM.YY';

module.exports.parse = (data) => {
  return data
    .split(/\r?\n/)
    .splice(FIRST_ROW_NUMBER)
    .filter((x) => x.length > 0)
    .map((r) => parseRow(r));
};

const parseRow = (row) => {
  const result = row
    .split(';')
    .splice(1)
    .reduce(
      (res, val, i) => ({ ...res, ...{ [COLS[i]]: autoParse(val) } }),
      {}
    );

  result.date = moment.utc(result.date, DATE_FORMAT);
  return result;
};

module.exports.dateFormat = DATE_FORMAT;
