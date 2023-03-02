import { CategoryCommand, SortBy } from './category.js';
import { JsonCommand } from './json.js';
import { TableCommand } from './table.js';
import { CategoriseCommand } from './categorise.js';
import { Item } from '../items.js';

export interface Args {
  file: string;
  category: string;
  sortBy: SortBy;
  json: boolean;
}

export interface Command {
  execute(items: Item[]): Promise<void>;
}

export function createCommands(args: Args): Command[] {
  let cmds = [new CategoriseCommand()];

  if (args.category) {
    cmds.push(new CategoryCommand(args.category, args.sortBy));
    return cmds;
  }

  cmds.push(args.json ? new JsonCommand() : new TableCommand());

  return cmds;
}
