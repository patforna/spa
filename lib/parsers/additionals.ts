import moment from 'moment';
import { Item } from '../items.js';
import { InputParser } from './index.js';

export class AdditionalInputParser implements InputParser {
  async parse(input: string): Promise<Item[]> {
    return JSON.parse(input).map((item: any) => ({
      date: moment(item.date),
      amount: item.amount,
      description: item.description,
    }));
  }
}
