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
  #items: Item[];
  constructor(path: string) {
    this.#path = path;
  }

  load(): Item[] {
    this.#items = JSON.parse(readFileSync(this.#path).toString());
    return this.#items;
  }

  save(item: Item): void {
    this.#items.push(item);
    this.saveAll(this.#items);
  }

  saveAll(items: Item[]): void {
    writeFileSync(this.#path, stringify(items));
    this.load();
  }
}

export function itemsForCategory(items: Item[], category: string): Item[] {
  return items.filter((item) => item.category === category);
}

export function asString(item: Item): string {
  return `${item.date.format('DD.MM.YYYY')} ${item.description} ${item.amount}`;
}
