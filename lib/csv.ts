import _ from 'lodash';
import autoParse from 'auto-parse';
import Papa from 'papaparse';

export function parse(input: string): object[] {
  const parsed = Papa.parse(input, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    transformHeader: _.camelCase,
    transform: (value: string) => {
      // attempt to parse the value as a date using multiple formats
      const parsedDate = moment(
        value,
        ['YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD', 'DD.MM.YY'],
        true
      );
      if (parsedDate.isValid()) {
        return parsedDate;
      }
      return value;
    },
  });

  return parsed.data;
}

import moment from 'moment';
import { Item, parseCard } from './items.js';

const FIRST_ROW_NUMBER = 12;
const COLS = ['date', 'description', 'amount', 'valuta'];
export const DATE_FORMAT = 'DD.MM.YY';

// FIXME refactor to use parse function above!
export function parseItems(data: string): Item[] {
  return data
    .split(/\r?\n/)
    .splice(FIRST_ROW_NUMBER)
    .filter((x) => x.length > 0)
    .map((r) => parseRowItem(r));
}

function parseRowItem(row: string): Item {
  const item = row
    .split(';') // FIXME parameterize
    .reduce(
      (res, val, i) => ({ ...res, ...{ [COLS[i]]: autoParse(val) } }),
      {}
    ) as Item;

  item.date = moment.utc(item.date, DATE_FORMAT);
  item.card = parseCard(item.description);
  item.valuta = moment.utc(item.valuta, DATE_FORMAT);
  return item;
}
