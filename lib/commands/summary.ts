import { Transaction } from '../transactions.js';
import { Summary } from '../summary.js';
import { tableFrom } from '../table.js';
import { Command } from './index.js';

export class SummaryCommand implements Command {
  constructor(private readonly sortBy: string) {}

  async execute(txs: Transaction[]): Promise<void> {
    console.log(tableFrom(new Summary(txs), this.sortBy));
  }
}
