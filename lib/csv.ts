import autoParse from 'auto-parse';
import moment from 'moment';
import { Card, Item } from './items';

const FIRST_ROW_NUMBER = 12;
const COLS = ['statement_date', 'description', 'amount', 'date'];
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
  item.statement_date = moment.utc(item.statement_date, DATE_FORMAT);
  item.card = parseCard(item);
  return item;
}

function parseCard(item: Item): Card {
  if (item.description.endsWith('7837')) return Card.Partner;
  if (item.description.endsWith('5885')) return Card.Partner;
  if (item.description.endsWith('1426')) return Card.Partner;
  if (item.description.endsWith('6107')) return Card.Self;

  return Card.Unknown;
}
