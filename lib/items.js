// repository to load and save manually processed items
const fs = require('fs');
const path = require('path');
const stringify = require('json-stringify-pretty-compact');

const rootDir = path.resolve(path.dirname(require.main.filename), '..');
const ignorePath = path.join(rootDir, 'data', 'ignored.json');
const manualPath = path.join(rootDir, 'data', 'manual.json');

exports.loadIgnore = () => {
  return load(ignorePath);
};

exports.saveIgnore = (items) => {
  save(items, ignorePath);
};

exports.loadManual = () => {
  return load(manualPath);
};

exports.saveManual = (items) => {
  save(items, manualPath);
};

const load = (path) => {
  return JSON.parse(fs.readFileSync(path));
};

const save = (path, items) => {
  fs.writeFileSync(path, stringify(items));
};
