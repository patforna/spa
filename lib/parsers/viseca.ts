import moment from 'moment';
import { Item } from '../items.js';
import { InputParser, parseCSV } from './index.js';
import _ from 'lodash';

interface VisecaItem {
  cardId: string;
  date: moment.Moment;
  amount: number;
  merchantName: string;
  merchantPlace: string;
  merchantCountry: string;
  stateType: string;
  details: string;
}

export class VisecaInputParser implements InputParser {
  async parse(input: string): Promise<Item[]> {
    const visecaItems = parseCSV(input)
      .map((x) => x as VisecaItem)
      .filter((x) => x.amount > 0 && x.stateType === 'BOOKED');

    const items: Item[] = [];
    for (const it of visecaItems) {
      items.push({
        date: it.date,
        amount: it.amount,
        description: _.join(
          [it.merchantName, it.merchantPlace, it.merchantCountry, it.details],
          ' | '
        ),
      } as Item);
    }

    return items;
  }
}
