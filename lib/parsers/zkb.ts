import moment from 'moment';
import { Item } from '../items.js';
import { InputParser, parseCSV } from './index.js';
import _ from 'lodash';

interface ZKBItem {
  date?: moment.Moment;
  bookingText: string;
  curr: string;
  amountDetails: number;
  debitChf: number;
  creditChf: number;
  paymentPurpose: string;
}

export class ZKBInputParser implements InputParser {
  async parse(input: string): Promise<Item[]> {
    const zkbItems = parseCSV(input)
      .map((x) => x as ZKBItem)
      .filter((x) => x.debitChf > 0 || x.amountDetails > 0);

    const items: Item[] = [];
    let parent: Item;
    for (const it of zkbItems) {
      if (it.date) {
        parent = null; // reset parent to indicate that we are not processing details
        items.push({
          date: it.date,
          amount: -it.debitChf,
          description: _.join([it.bookingText, it.paymentPurpose], ' | '),
        } as Item);
      } else {
        // this happens when a transaction is followed by details on separate lines
        if (!parent) {
          parent = items.pop(); // only pop parent once in case there is more than one detail transaction
        }

        items.push({
          date: parent.date,
          amount: -it.amountDetails,
          description: _.join(
            [parent.description, it.bookingText, it.paymentPurpose],
            ' | '
          ),
        } as Item);
      }
    }

    return items;
  }
}
