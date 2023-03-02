import { CategoryCommand, SortBy } from './category.js';
import { JsonCommand } from './json.js';
import { TableCommand } from './table.js';
import { CategoriseCommand } from './categorise.js';
import { Item } from '../items.js';

export interface Args {
  file: string;
  category: string;
  sortBy: string;
  json: boolean;
}

export interface Command {
  execute(items: Item[]): Promise<void>;
}

export function createCommands(args: Args): Command[] {
  let cmds = [new CategoriseCommand()];

  if (args.category) {
    const sortBy = args.sortBy == 'amount' ? SortBy.Amount : SortBy.Date;
    cmds.push(new CategoryCommand(args.category, sortBy));
    return cmds;
  }

  cmds.push(args.json ? new JsonCommand() : new TableCommand());

  return cmds;
}
