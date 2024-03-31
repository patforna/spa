import autoParse from 'auto-parse';
import moment from 'moment';
import { Item, parseCard } from './items.js';

const FIRST_ROW_NUMBER = 12;
const COLS = ['date', 'description', 'amount', 'valuta'];
export const DATE_FORMAT = 'DD.MM.YY';

export function parse(data: string): Item[] {
  return data
    .split(/\r?\n/)
    .splice(FIRST_ROW_NUMBER)
    .filter((x) => x.length > 0)
    .map((r) => parseRow(r));
}

function parseRow(row: string): Item {
  const item = row
    .split(';')
    .reduce(
      (res, val, i) => ({ ...res, ...{ [COLS[i]]: autoParse(val) } }),
      {}
    ) as Item;

  item.date = moment.utc(item.date, DATE_FORMAT);
  item.card = parseCard(item.description);
  item.valuta = moment.utc(item.valuta, DATE_FORMAT);
  return item;
}
