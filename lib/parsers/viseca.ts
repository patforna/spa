import moment from 'moment';
import { Transaction } from '../transactions.js';
import { InputParser, parseCSV } from './index.js';
import _ from 'lodash';

interface VisecaRow {
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
  async parse(input: string): Promise<Transaction[]> {
    const rows = parseCSV(input)
      .map((x) => x as VisecaRow)
      .filter((x) => x.stateType === 'BOOKED');

    const txs: Transaction[] = [];
    for (const row of rows) {
      txs.push({
        date: row.date,
        amount: -row.amount,
        description: _.join(
          [
            row.merchantName,
            row.merchantPlace,
            row.merchantCountry,
            row.details,
            '#viseca',
          ],
          ' | '
        ),
      } as Transaction);
    }

    return txs;
  }
}
