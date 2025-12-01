import { readFileSync, writeFileSync } from 'fs';
import stringify from 'json-stringify-pretty-compact';
import _ from 'lodash';
import moment from 'moment';
import { IGNORE } from './categoriser.js';

// FIXME meh... FKB specific - not sure it should be here
// regex matching everything after the descriptoin (e.g. " - 29.01.2022 17:03...")
// eslint-disable-next-line no-useless-escape
const afterDesc = / - \d\d\.\d\d\.\d\d\d\d\ \d\d:\d\d.*/;

export interface Item {
  date: moment.Moment;
  amount: number;
  description: string;
  category: string;
  comment: string;
  card: Card;
  valuta: moment.Moment; // DO NOT use; this is here for legacy reason as some of the overrides have been wrongly saved with valuta instead of date.
}

export enum Card {
  Unknown = 0,
  Partner = 1,
  Self = 2,
}

// FIXME this would probably be better done when parsing input (also: FKB specific logic)
export function parseCard(description: string): Card {
  if (description.includes('7837')) return Card.Partner;
  if (description.includes('5885')) return Card.Partner;
  if (description.includes('1426')) return Card.Partner;
  if (description.includes('6107')) return Card.Self;
  if (description.includes('3048')) return Card.Self;
  if (description.toLowerCase().includes('self')) return Card.Self;
  if (description.toLowerCase().includes('partner')) return Card.Partner;

  return Card.Unknown;
}

// FIXME this should maybe be called OverridesRepo once additionals.json is gone...
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
      it.card = parseCard(it.description); // FIXME this should be done when parsing input (it actually is - remove once description is removed from overrides and additionals.json is gone)
    });
    return this.#items;
  }

  save(item: Item): void {
    this.#items.push(item);
    this.saveAll(this.#items);
  }

  saveAll(items: Item[]): void {
    const toSave = _.sortBy(items, 'date').map(
      (it) =>
        // date, amount are used as primary keys
        // category and comment are user-generated content we want to hold on to
        _.pick(it, ['date', 'amount', 'description', 'category', 'comment']) // FIXME do not store description as it's not needed (double check!)
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

const REPLACEMENTS = [
  /^Purchase ZKB Visa Debit card no\. xxxx \d+,? /,
  /^Online purchase ZKB Visa Debit card no\. xxxx \d+,? /,
  /^Refund ZKB Visa Debit card no\. xxxx \d+,? /,
  /^Debit eBanking Mobile.*: /,
  /^Debit Account transfer: /,
  /^Credit originator: /,
];

const IGNORED_PATTERNS = [
  /^CARD_TRANSACTION-\d+$/,
  /^Debit eBanking Mobile.*$/,
];

const IGNORED_STRINGS = new Set(['OUT', 'IN', 'NEUTRAL', 'CHE']);

export function shortDescription(item: Item): string {
  return item.description
    .replace('Zahlung - ', '')
    .replace(afterDesc, '')
    .split('|')
    .map((s) => s.trim())
    .map((s) => REPLACEMENTS.reduce((acc, regex) => acc.replace(regex, ''), s))
    .filter((s) => !!s)
    .filter((s) => !IGNORED_PATTERNS.some((regex) => s.match(regex)))
    .filter((s) => !IGNORED_STRINGS.has(s))
    .join(' | ');
}

export function asString(item: Item, showCategory = false): string {
  const parts = [];
  if (showCategory) parts.push(_.padStart(item.category.toUpperCase(), 12));
  parts.push(item.date.format('YYYY-MM-DD'));
  parts.push(_.padStart(_.round(item.amount).toLocaleString(), 10));
  parts.push(_.padStart(Card[item.card] || '-', 8));
  parts.push(shortDescription(item));
  if (item.comment) parts.push(`| Comment: ${item.comment}`);

  return parts.join(' | ');
}
