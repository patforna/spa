import { readFileSync, writeFileSync } from 'fs';
import stringify from 'json-stringify-pretty-compact';
import { Moment } from 'moment';

export interface Item {
  date: Moment;
  description: string;
  amount: number;
  category: string;
}

export class ItemRepo {
  #path: string;
  constructor(path: string) {
    this.#path = path;
  }

  load(): Item[] {
    return JSON.parse(readFileSync(this.#path).toString());
  }

  save(items: Item[]): void {
    writeFileSync(this.#path, stringify(items));
  }
}

export function asString(item: Item): string {
  return `${item.date.format('DD.MM.YYYY')} ${item.description} ${item.amount}`;
}
