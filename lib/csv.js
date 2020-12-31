import autoParse from 'auto-parse';
import pkg from 'moment';
const { utc } = pkg;

const FIRST_ROW_NUMBER = 12;
const COLS = ['description', 'amount', 'date'];
const DATE_FORMAT = 'DD.MM.YY';

export function parse(data) {
  return data
    .split(/\r?\n/)
    .splice(FIRST_ROW_NUMBER)
    .filter((x) => x.length > 0)
    .map((r) => parseRow(r));
}

const parseRow = (row) => {
  const result = row
    .split(';')
    .splice(1)
    .reduce(
      (res, val, i) => ({ ...res, ...{ [COLS[i]]: autoParse(val) } }),
      {}
    );

  result.date = utc(result.date, DATE_FORMAT);
  return result;
};

export const dateFormat = DATE_FORMAT;
