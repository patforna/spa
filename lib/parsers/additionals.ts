import moment from 'moment';
import { Item } from '../items.js';
import { InputParser } from './index.js';

interface AdditionalItem {
  date: string;
  amount: number;
  description: string;
}

export class AdditionalInputParser implements InputParser {
  async parse(input: string): Promise<Item[]> {
    return JSON.parse(input).map((item: AdditionalItem) => ({
      date: moment(item.date),
      amount: item.amount,
      description: item.description,
    }));
  }
}
