import { readFileSync } from 'fs';

export interface Rules {
  [category: string]: RegExp[];
}

export class RulesRepo {
  #path: string;

  constructor(path: string) {
    this.#path = path;
  }

  load(): Rules {
    const raw = JSON.parse(readFileSync(this.#path).toString()) as {
      [category: string]: string[];
    };

    const rules: Rules = {};
    for (const [category, patterns] of Object.entries(raw)) {
      rules[category] = patterns.map((s) => new RegExp(s, 'i'));
    }

    return rules;
  }
}
