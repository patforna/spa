import { Summary } from '../summary';
import { tableFrom } from '../table.js';
import { Command } from './index.js';

export class TableCommand implements Command {
  async execute(summary: Summary): Promise<void> {
    console.log(tableFrom(summary));
  }
}
