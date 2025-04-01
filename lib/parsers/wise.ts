import moment from 'moment';
import { FxRateService } from '../fxRates.js';
import { Item } from '../items.js';
import { InputParser, parseCSV } from './index.js';

interface WiseItem {
  id: string;
  status: string;
  direction: string;
  createdOn: moment.Moment;
  sourceAmountAfterFees: number;
  sourceCurrency: string;
  targetName: string;
}

export class WiseInputParser implements InputParser {
  constructor(private readonly fxRateService: FxRateService) {}

  async parse(input: string): Promise<Item[]> {
    const wiseItems = parseCSV(input)
      .map((x) => x as WiseItem)
      .filter(
        (x) =>
          x.direction == 'OUT' &&
          x.status == 'COMPLETED' &&
          x.sourceAmountAfterFees > 0
      );

    const items: Item[] = [];
    for (const it of wiseItems) {
      const amountInCHF = await this.fxRateService.convert(
        it.sourceCurrency,
        'CHF',
        it.sourceAmountAfterFees,
        it.createdOn
      );

      items.push({
        date: it.createdOn,
        amount: amountInCHF,
        description: `${it.targetName} | #wise`,
      } as Item);
    }

    return items;
  }
}
