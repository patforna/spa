import autoParse from 'auto-parse';
import moment from 'moment';
import { Item, parseCard } from '../items.js';
import { InputParser } from './index.js';

export class FKBInputParser implements InputParser {
  private static readonly FIRST_ROW_NUMBER = 12;
  private static readonly COLS = ['date', 'description', 'amount', 'valuta'];
  private static readonly DATE_FORMAT = 'DD.MM.YY';

  parse(input: string): Promise<Item[]> {
    return Promise.resolve(
      input
        .split(/\r?\n/)
        .splice(FKBInputParser.FIRST_ROW_NUMBER)
        .filter((x) => x.length > 0)
        .map((r) => this.parseRowItem(r))
    );
  }

  private parseRowItem(row: string): Item {
    const item = row.split(';').reduce(
      (res, val, i) => ({
        ...res,
        ...{ [FKBInputParser.COLS[i]]: autoParse(val) },
      }),
      {}
    ) as Item;

    item.date = moment.utc(item.date, FKBInputParser.DATE_FORMAT);
    item.card = parseCard(item.description);
    item.valuta = moment.utc(item.valuta, FKBInputParser.DATE_FORMAT);
    return item;
  }
}
