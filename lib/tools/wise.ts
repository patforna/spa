import _ from 'lodash';
import currency from 'currency.js';
import { parse } from '../csv.js';

const GBP_CHF = 1.15; // adjust if necessary before running bin/tools wise ...

export interface WiseItem {
  id: string;
  status: string;
  direction: string;
  createdOn: moment.Moment;
  sourceAmountAfterFees: number;
  sourceCurrency: string;
  targetName: string;
}

// FIXME append directly to additional items
export function processWise(data: string) {
  const parsed = parse(data)
    .map((x) => x as WiseItem)
    .filter(
      (x) =>
        x.direction == 'OUT' &&
        x.status == 'COMPLETED' &&
        x.sourceAmountAfterFees > 0
    );

  const additionalItems = parsed.map((item) => {
    return {
      date: item.createdOn,
      amount: -convertGBPToCHF(item.sourceAmountAfterFees),
      description: `${item.targetName} | #wise`,
    };
  });

  console.log(JSON.stringify(_.sortBy(additionalItems, 'date'), null, 2));
}

function convertGBPToCHF(amountInGBP: number) {
  return currency(amountInGBP).multiply(GBP_CHF);
}
