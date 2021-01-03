import stringify from 'json-stringify-pretty-compact';
import { Item } from '../items';
import { Summary } from '../summary';
import { Command } from './index.js';

export class JsonCommand implements Command {
  async execute(items: Item[]): Promise<void> {
    console.log(stringify(new Summary(items).data));
  }
}
