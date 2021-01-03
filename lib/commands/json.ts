import stringify from 'json-stringify-pretty-compact';
import { Summary } from '../summary';
import { Command } from './index.js';

export class JsonCommand implements Command {
  async execute(summary: Summary): Promise<void> {
    console.log(stringify(summary.data));
  }
}
