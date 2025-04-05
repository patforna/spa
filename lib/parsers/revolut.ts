import moment from 'moment';
import { Item } from '../items.js';
import { InputParser, parseCSV } from './index.js';
import _ from 'lodash';

interface RevolutItem {
  type: string;
  completedDate: moment.Moment;
  amount: number;
  fee: number;
  currency: string;
  description: string;
  state: string;
}

export class RevolutInputParser implements InputParser {
  async parse(input: string): Promise<Item[]> {
    const revolutItems = parseCSV(input)
      .map((x) => x as RevolutItem)
      .filter((x) => x.type != 'TOPUP' && x.state == 'COMPLETED');

    const items: Item[] = [];
    for (const it of revolutItems) {
      items.push({
        date: it.completedDate,
        amount: -it.amount,
        description: _.join([it.type, it.description, '#revolut'], ' | '),
      } as Item);
    }

    return items;
  }
}
