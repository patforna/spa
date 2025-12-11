import { Dayjs } from '../date.js';
import { FxRateService } from '../fxRates.js';
import { Card, Transaction } from '../transactions.js';
import { InputParser, parseCSV } from './index.js';

// using completedDate here as opposed to startedDate because monthly
// statements from revolut are sliced by completedDate ¯\_(ツ)_/¯
interface RevolutRow {
  type: string;
  completedDate: Dayjs;
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
      .filter(
        (x) =>
          x.type !== 'TOPUP' && x.type !== 'TRANSFER' && x.state === 'COMPLETED'
      );

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
        description: [row.type, row.description, '#revolut'].join(' | '),
        card: Card.Self,
      } as Transaction);
    }

    return txs;
  }
}
