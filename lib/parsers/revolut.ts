import moment from 'moment';
import { FxRateService } from '../fxRates.js';
import { Item } from '../items.js';
import { InputParser, parseCSV } from './index.js';
import _ from 'lodash';

// using completedDate here as opposed to startedDate because monthly
// statements from revolut are sliced by completedDate ¯\_(ツ)_/¯
interface RevolutItem {
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

  async parse(input: string): Promise<Item[]> {
    const revolutItems = parseCSV(input)
      .map((x) => x as RevolutItem)
      .filter((x) => x.type != 'TOPUP' && x.state == 'COMPLETED');

    const items: Item[] = [];
    for (const it of revolutItems) {
      let amount = it.amount;
      if (it.currency !== 'CHF') {
        amount = await this.fxRateService.convert(
          it.currency,
          'CHF',
          amount,
          it.completedDate
        );
      }
      items.push({
        date: it.completedDate,
        amount: amount,
        description: _.join([it.type, it.description, '#revolut'], ' | '),
      } as Item);
    }

    return items;
  }
}
