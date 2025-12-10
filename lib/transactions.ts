import { readFileSync, writeFileSync } from 'fs';
import stringify from 'json-stringify-pretty-compact';
import _ from 'lodash';
import dayjs, { Dayjs } from './date.js';
import { IGNORE } from './categoriser.js';

export interface Transaction {
  date: Dayjs;
  amount: number;
  description: string;
  category: string;
  comment: string;
  card: Card;
}

export interface Override {
  date: Dayjs;
  amount: number;
  category: string;
  comment: string;
  splits?: OverrideSplit[];
}

export interface OverrideSplit {
  amount: number;
  category: string;
  comment?: string;
}

export enum Card {
  Unknown = 0,
  Partner = 1,
  Self = 2,
}

export class OverridesRepo {
  #path: string;

  constructor(path: string) {
    this.#path = path;
  }

  load(): Override[] {
    const txs = JSON.parse(readFileSync(this.#path).toString());
    txs.forEach((tx) => {
      tx.date = dayjs.utc(tx.date);
    });
    return txs;
  }

  saveAll(txs: Override[]): void {
    const toSave = _.sortBy(txs, 'date').map((tx) =>
      tx.splits
        ? _.pick(tx, ['date', 'amount', 'splits'])
        : _.pick(tx, ['date', 'amount', 'category', 'comment'])
    );
    writeFileSync(this.#path, stringify(toSave, { maxLength: 0 }) + '\n');
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

export function findOverride(overrides: Override[], tx: Transaction): Override {
  return overrides.find(({ date, amount }) => {
    return dayjs(date).isSame(tx.date) && amount === tx.amount;
  });
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

export function shortDescription(description: string): string {
  return description
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
  parts.push(_.padStart(Math.round(tx.amount).toLocaleString(), 10));
  parts.push(_.padStart(Card[tx.card] || '-', 8));
  parts.push(shortDescription(tx.description));
  if (tx.comment) parts.push(`| Comment: ${tx.comment}`);

  return parts.join(' | ');
}

/**
 * Expands split transactions in place.
 * If an input transaction matches a split override (by date + amount),
 * it is replaced with the split children.
 */
export function expandSplits(txs: Transaction[], overrides: Override[]): void {
  const splitOverrides = overrides.filter(
    (o) => o.splits && o.splits.length > 0
  );

  for (let i = txs.length - 1; i >= 0; i--) {
    const tx = txs[i];
    const splitOverride = findOverride(splitOverrides, tx);

    if (splitOverride?.splits) {
      const childTxs = splitOverride.splits.map((split) => ({
        ...split,
        date: tx.date,
        description: tx.description,
        card: tx.card,
        comment: split.comment || tx.comment,
      }));
      txs.splice(i, 1, ...childTxs);
    }
  }
}
