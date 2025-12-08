import moment from 'moment';
import { FxRateService } from '../fxRates.js';
import { Transaction } from '../transactions.js';
import { InputParser, parseCSV } from './index.js';
import _ from 'lodash';

interface WiseRow {
  id: string;
  status: string;
  direction: string;
  createdOn: moment.Moment;
  sourceAmountAfterFees: number;
  sourceCurrency: string;
  sourceName: string;
  targetName: string;
  reference: string;
}

export class WiseInputParser implements InputParser {
  constructor(private readonly fxRateService: FxRateService) {}

  async parse(input: string): Promise<Transaction[]> {
    const rows = parseCSV(input)
      .map((x) => x as WiseRow)
      .filter((x) => x.sourceAmountAfterFees != 0);

    const txs: Transaction[] = [];
    for (const row of rows) {
      const amountInCHF = await this.fxRateService.convert(
        row.sourceCurrency,
        'CHF',
        row.sourceAmountAfterFees,
        row.createdOn
      );

      const merchant =
        row.status === 'REFUNDED' ? row.sourceName : row.targetName;

      txs.push({
        date: row.createdOn,
        amount: row.direction === 'OUT' ? -amountInCHF : amountInCHF,
        description: _.join(
          [row.id, row.direction, merchant, row.reference, '#wise'],
          ' | '
        ),
      } as Transaction);
    }

    return txs;
  }
}
