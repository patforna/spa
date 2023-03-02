import { Item } from '../items.js';
import { Summary } from '../summary.js';
import { tableFrom } from '../table.js';
import { Command } from './index.js';

export class TableCommand implements Command {
  async execute(items: Item[]): Promise<void> {
    console.log(tableFrom(new Summary(items)));
  }
}
