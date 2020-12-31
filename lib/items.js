// repository to load and save manually processed items
import { readFileSync, writeFileSync } from 'fs';
import stringify from 'json-stringify-pretty-compact';
import { dirname, join, resolve } from 'path';

const root = () => {
  let x = '/Users/you/code/spa'; // FIXME dirname(require.main.filename);
  if (x.endsWith('/bin')) x = resolve(x, '..');
  return x;
};

const rootDir = root();
const ignorePath = join(rootDir, 'data', 'ignored.json');
const manualPath = join(rootDir, 'data', 'manual.json');

export function loadIgnore() {
  return load(ignorePath);
}

export function saveIgnore(items) {
  save(items, ignorePath);
}

export function loadManual() {
  return load(manualPath);
}

export function saveManual(items) {
  save(items, manualPath);
}

const load = (path) => {
  return JSON.parse(readFileSync(path));
};

const save = (path, items) => {
  writeFileSync(path, stringify(items));
};
