import moment from 'moment';
import { Transaction } from '../transactions.js';
import { InputParser, parseCSV } from './index.js';
import _ from 'lodash';

interface ZKBRow {
  date?: moment.Moment;
  bookingText: string;
  amountDetails: number;
  debitChf: number;
  creditChf: number;
  paymentPurpose: string;
}

export class ZKBInputParser implements InputParser {
  async parse(input: string): Promise<Transaction[]> {
    const rows = parseCSV(input).map((x) => x as ZKBRow);

    const txs: Transaction[] = [];
    let parent: Transaction;
    for (const row of rows) {
      if (row.date) {
        const amount = row.debitChf > 0 ? -row.debitChf : row.creditChf;
        parent = null; // reset parent to indicate that we are not processing details
        txs.push({
          date: row.date,
          amount: amount,
          description: _.join(
            [row.bookingText, row.paymentPurpose, '#zkb'],
            ' | '
          ),
        } as Transaction);
      } else {
        // this happens when a transaction is followed by details on separate lines
        if (!parent) {
          parent = txs.pop(); // only pop parent once in case there is more than one detail transaction
        }

        txs.push({
          date: parent.date,
          amount: -row.amountDetails,
          description: _.join(
            [
              _.replace(parent.description, '#zkb', ''),
              row.bookingText,
              row.paymentPurpose,
              '#zkb',
            ],
            ' | '
          ),
        } as Transaction);
      }
    }

    return txs;
  }
}
