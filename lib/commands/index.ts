import { Item } from '../items.js';

export interface Command {
  execute(items: Item[]): Promise<void>;
}
