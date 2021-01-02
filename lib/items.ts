// repository to load and save manually processed items
import { readFileSync, writeFileSync } from 'fs';
import stringify from 'json-stringify-pretty-compact';
import { Moment } from 'moment';
import { join, resolve } from 'path';

export interface Item {
  date: Moment;
  description: string;
  amount: number;
  category: string;
}

const root = () => {
  let x = '/Users/you/code/spa'; // FIXME dirname(require.main.filename);
  if (x.endsWith('/bin')) x = resolve(x, '..');
  return x;
};

const rootDir = root();
const ignorePath = join(rootDir, 'data', 'ignored.json');
const manualPath = join(rootDir, 'data', 'manual.json');

export function loadIgnore(): Item[] {
  return load(ignorePath);
}

export function saveIgnore(items: Item[]): void {
  save(ignorePath, items);
}

export function loadManual(): Item[] {
  return load(manualPath);
}

export function saveManual(items: Item[]): void {
  save(manualPath, items);
}

const load = (path: string): Item[] => {
  return JSON.parse(readFileSync(path).toString());
};

const save = (path: string, items: Item[]): void => {
  writeFileSync(path, stringify(items));
};
