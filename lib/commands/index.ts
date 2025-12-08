import { Transaction } from '../transactions.js';

export interface Command {
  execute(txs: Transaction[]): Promise<void>;
}
