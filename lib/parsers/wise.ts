import { Dayjs } from '../date.js';
import { FxRateService } from '../fxRates.js';
import { Card, Transaction } from '../transactions.js';
import { InputParser, parseCSV } from './index.js';

interface WiseRow {
  status: string;
  direction: string;
  createdOn: Dayjs;
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
        description: [row.direction, merchant, row.reference, '#wise'].join(
          ' | '
        ),
        card: Card.Unknown,
      } as Transaction);
    }

    return txs;
  }
}
