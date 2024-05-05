import { parse } from '../csv.js';
import { Item } from '../items.js';
import { additionalsRepo } from '../wiring.js';
import { fxRateService } from './wiring.js';

export interface WiseItem {
  id: string;
  status: string;
  direction: string;
  createdOn: moment.Moment;
  sourceAmountAfterFees: number;
  sourceCurrency: string;
  targetName: string;
}

export async function processWise(data: string) {
  const items = parse(data)
    .map((x) => x as WiseItem)
    .filter(
      (x) =>
        x.direction == 'OUT' &&
        x.status == 'COMPLETED' &&
        x.sourceAmountAfterFees > 0
    );

  const additionalItems = additionalsRepo.load();
  for (const it of items) {
    const amountInCHF = await fxRateService.convert(
      it.sourceCurrency,
      'CHF',
      it.sourceAmountAfterFees,
      it.createdOn
    );

    additionalItems.push({
      date: it.createdOn,
      amount: -amountInCHF,
      description: `${it.targetName} | #wise`,
    } as Item);
  }

  additionalsRepo.saveAll(additionalItems);
}
