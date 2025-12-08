import { readFileSync, writeFileSync } from 'fs';
import stringify from 'json-stringify-pretty-compact';
import _ from 'lodash';
import moment from 'moment';
import { IGNORE } from './categoriser.js';

export interface Transaction {
  date: moment.Moment;
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

// FIXME this would probably be better done when parsing input
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

export class OverridesRepo {
  #path: string;
  #txs: Transaction[];
  constructor(path: string) {
    this.#path = path;
  }

  load(): Transaction[] {
    this.#txs = JSON.parse(readFileSync(this.#path).toString());
    this.#txs.forEach((tx) => {
      tx.date = moment.utc(tx.date);
      tx.card = parseCard(tx.description); // FIXME this should be done when parsing input (it actually is - remove once description is removed from overrides)
    });
    return this.#txs;
  }

  save(tx: Transaction): void {
    this.#txs.push(tx);
    this.saveAll(this.#txs);
  }

  saveAll(txs: Transaction[]): void {
    const toSave = _.sortBy(txs, 'date').map((tx) =>
      // date, amount are used as primary keys
      // category and comment are user-generated content we want to hold on to
      _.pick(tx, ['date', 'amount', 'description', 'category', 'comment'])
    );
    writeFileSync(this.#path, stringify(toSave));
    this.load();
  }
}

export function txsForCategory(
  txs: Transaction[],
  category: string
): Transaction[] {
  return txs.filter((tx) => tx.category === category);
}

export function txsExcludingIgnored(txs: Transaction[]): Transaction[] {
  return txs.filter((tx) => tx.category !== IGNORE);
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
  /^Debit eBanking Mobile.*$/,
  /^CARD_TRANSACTION-\d+$/,
];

const IGNORED_STRINGS = new Set(['OUT', 'IN', 'NEUTRAL', 'CHE']);

export function shortDescription(tx: Transaction): string {
  return tx.description
    .replace('Zahlung - ', '')
    .split('|')
    .map((s) => s.trim())
    .map((s) => REPLACEMENTS.reduce((acc, regex) => acc.replace(regex, ''), s))
    .filter((s) => !!s)
    .filter((s) => !IGNORED_PATTERNS.some((regex) => s.match(regex)))
    .filter((s) => !IGNORED_STRINGS.has(s))
    .join(' | ');
}

export function asString(tx: Transaction, showCategory = false): string {
  const parts = [];
  if (showCategory) parts.push(_.padStart(tx.category.toUpperCase(), 12));
  parts.push(tx.date.format('YYYY-MM-DD'));
  parts.push(_.padStart(_.round(tx.amount).toLocaleString(), 10));
  parts.push(_.padStart(Card[tx.card] || '-', 8));
  parts.push(shortDescription(tx));
  if (tx.comment) parts.push(`| Comment: ${tx.comment}`);

  return parts.join(' | ');
}
