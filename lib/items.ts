import { readFileSync, writeFileSync } from 'fs';
import stringify from 'json-stringify-pretty-compact';
import _ from 'lodash';
import moment from 'moment';
import { IGNORE } from './categoriser.js';

// regex matching everything after the descriptoin (e.g. " - 29.01.2022 17:03...")
const afterDesc = / - \d\d\.\d\d\.\d\d\d\d\ \d\d:\d\d.*/;

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

export function itemsExcludingIgnored(items: Item[]): Item[] {
  return items.filter((item) => item.category !== IGNORE);
}

export function shortDescription(item: Item): string {
  return item.description.replace('Zahlung - ', '').replace(afterDesc, '');
}

export function asString(item: Item, showCategory = false): string {
  const parts = [];
  if (showCategory) parts.push(_.padStart(item.category.toUpperCase(), 10));
  parts.push(item.statement_date.format('DD.MM.YY'));
  parts.push(_.padStart(_.round(item.amount).toLocaleString(), 6));
  parts.push(_.padStart(Card[item.card], 7));
  parts.push(shortDescription(item));
  if (item.comment) parts.push(`Comment: ${item.comment}`);

  return parts.join(' | ');
}
