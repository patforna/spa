import stringify from 'json-stringify-pretty-compact';
import { Transaction } from '../transactions.js';
import { Summary } from '../summary.js';
import { Command } from './index.js';

export class JsonCommand implements Command {
  async execute(txs: Transaction[]): Promise<void> {
    console.log(stringify(new Summary(txs).data));
  }
}
