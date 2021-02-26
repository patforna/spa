import { readFileSync, writeFileSync } from 'fs';
import stringify from 'json-stringify-pretty-compact';
import _ from 'lodash';
import moment from 'moment';

export interface Item {
  date: moment.Moment;
  statement_date: moment.Moment;
  amount: number;
  description: string;
  category: string;
  comment: string;
  card: Card;
}

export enum Card {
  Unknown = 0,
  Partner = 1,
  Self = 2,
}

export class ItemRepo {
  #path: string;
  #items: Item[];
  constructor(path: string) {
    this.#path = path;
  }

  load(): Item[] {
    this.#items = JSON.parse(readFileSync(this.#path).toString());
    this.#items.forEach((it) => {
      it.date = moment.utc(it.date);
      it.statement_date = moment.utc(it.statement_date);
    });
    return this.#items;
  }

  save(item: Item): void {
    this.#items.push(item);
    this.saveAll(this.#items);
  }

  saveAll(items: Item[]): void {
    const toSave = _.sortBy(items, ['date']).map((it) =>
      _.pick(it, ['date', 'amount', 'description', 'category', 'comment'])
    );
    writeFileSync(this.#path, stringify(toSave));
    this.load();
  }
}

export function itemsForCategory(items: Item[], category: string): Item[] {
  return items.filter((item) => item.category === category);
}

export function asString(item: Item): string {
  const parts = item.description.split(' - ');
  const desc = parts.length == 4 ? parts[1] : item.description;

  return `${item.statement_date.format('DD.MM.YYYY')} | CHF ${
    item.amount
  } | ${desc} | Card: ${Card[item.card]}`;
}
