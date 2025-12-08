import moment from 'moment';
import { FxRateService } from '../fxRates.js';
import { Transaction } from '../transactions.js';
import { InputParser, parseCSV } from './index.js';
import _ from 'lodash';

// using completedDate here as opposed to startedDate because monthly
// statements from revolut are sliced by completedDate ¯\_(ツ)_/¯
interface RevolutRow {
  type: string;
  completedDate: moment.Moment;
  amount: number;
  fee: number;
  currency: string;
  description: string;
  state: string;
}

export class RevolutInputParser implements InputParser {
  constructor(private readonly fxRateService: FxRateService) {}

  async parse(input: string): Promise<Transaction[]> {
    const rows = parseCSV(input)
      .map((x) => x as RevolutRow)
      .filter((x) => x.type != 'TOPUP' && x.state == 'COMPLETED');

    const txs: Transaction[] = [];
    for (const row of rows) {
      let amount = row.amount;
      if (row.currency !== 'CHF') {
        amount = await this.fxRateService.convert(
          row.currency,
          'CHF',
          amount,
          row.completedDate
        );
      }
      txs.push({
        date: row.completedDate,
        amount: amount,
        description: _.join([row.type, row.description, '#revolut'], ' | '),
      } as Transaction);
    }

    return txs;
  }
}
