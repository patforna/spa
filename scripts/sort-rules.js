#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const rulesPath = join(process.cwd(), 'data/rules.json');
const rules = JSON.parse(readFileSync(rulesPath, 'utf-8'));

// Sort categories alphabetically
const sortedRules = {};
for (const category of Object.keys(rules).sort()) {
  // Sort patterns within each category, keeping # tags first
  sortedRules[category] = rules[category].sort((a, b) => {
    const aIsTag = a.startsWith('#');
    const bIsTag = b.startsWith('#');
    if (aIsTag && !bIsTag) return -1;
    if (!aIsTag && bIsTag) return 1;
    return a.localeCompare(b);
  });
}

writeFileSync(rulesPath, JSON.stringify(sortedRules, null, 2) + '\n');
console.log('Sorted data/rules.json');
