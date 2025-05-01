import moment from 'moment';
import { FxRateService } from '../fxRates.js';
import { Item } from '../items.js';
import { InputParser, parseCSV } from './index.js';
import _ from 'lodash';

interface WiseItem {
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

  async parse(input: string): Promise<Item[]> {
    const wiseItems = parseCSV(input)
      .map((x) => x as WiseItem)
      .filter((x) => x.sourceAmountAfterFees != 0);

    const items: Item[] = [];
    for (const it of wiseItems) {
      const amountInCHF = await this.fxRateService.convert(
        it.sourceCurrency,
        'CHF',
        it.sourceAmountAfterFees,
        it.createdOn
      );

      const merchant = it.status === 'REFUNDED' ? it.sourceName : it.targetName;

      items.push({
        date: it.createdOn,
        amount: it.direction === 'OUT' ? amountInCHF : -amountInCHF,
        description: _.join(
          [it.id, it.direction, merchant, it.reference, '#wise'],
          ' | '
        ),
      } as Item);
    }

    return items;
  }
}
