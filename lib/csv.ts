import autoParse from 'auto-parse';
import moment from 'moment';
import { Item } from './items';

const FIRST_ROW_NUMBER = 12;
const COLS = ['description', 'amount', 'date'];
export const DATE_FORMAT = 'DD.MM.YY';

export function parse(data: string): Item[] {
  return data
    .split(/\r?\n/)
    .splice(FIRST_ROW_NUMBER)
    .filter(x => x.length > 0)
    .map(r => parseRow(r));
}

const parseRow = (row: string): Item => {
  const item = row
    .split(';')
    .splice(1)
    .reduce(
      (res, val, i) => ({ ...res, ...{ [COLS[i]]: autoParse(val) } }),
      {}
    ) as Item;

  item.date = moment.utc(item.date, DATE_FORMAT);
  return item;
};
