import moment from 'moment';
import { Item } from '../items.js';
import { InputParser, parseCSV } from './index.js';
import _ from 'lodash';

interface ZKBItem {
  date?: moment.Moment;
  bookingText: string;
  amountDetails: number;
  debitChf: number;
  creditChf: number;
  paymentPurpose: string;
}

export class ZKBInputParser implements InputParser {
  async parse(input: string): Promise<Item[]> {
    const xxx = parseCSV(input);
    const zkbItems = xxx.map((x) => x as ZKBItem);

    const items: Item[] = [];
    let parent: Item;
    for (const it of zkbItems) {
      if (it.date) {
        const amount = it.debitChf > 0 ? it.debitChf : -it.creditChf;
        parent = null; // reset parent to indicate that we are not processing details
        items.push({
          date: it.date,
          amount: amount,
          description: _.join(
            [it.bookingText, it.paymentPurpose, '#zkb'],
            ' | '
          ),
        } as Item);
      } else {
        // this happens when a transaction is followed by details on separate lines
        if (!parent) {
          parent = items.pop(); // only pop parent once in case there is more than one detail transaction
        }

        items.push({
          date: parent.date,
          amount: it.amountDetails,
          description: _.join(
            [
              _.replace(parent.description, '#zkb', ''),
              it.bookingText,
              it.paymentPurpose,
              '#zkb',
            ],
            ' | '
          ),
        } as Item);
      }
    }

    return items;
  }
}
