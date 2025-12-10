import { Output } from '../output.js';
import { Summary } from '../summary.js';
import { tableFrom } from '../table.js';
import { Transaction } from '../transactions.js';
import { Command } from './index.js';

export class SummaryCommand implements Command {
  constructor(
    private readonly sortBy: string,
    private readonly output: Output
  ) {}

  async execute(txs: Transaction[]): Promise<void> {
    this.output.log(tableFrom(new Summary(txs), this.sortBy));
  }
}
