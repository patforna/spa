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
    cmds.push(new CategoryCommand(args.category, parseSortBy(args.sortBy)));
    return cmds;
  }

  cmds.push(args.json ? new JsonCommand() : new TableCommand());

  return cmds;
}

function parseSortBy(s: string): SortBy {
  switch (s) {
    case 'amount':
      return SortBy.Amount;
    case 'card':
      return SortBy.Card;
    case 'category':
      return SortBy.Category;
    case 'comment':
      return SortBy.Comment;
    case 'date':
      return SortBy.Date;
    case 'description':
      return SortBy.Description;
    default:
      throw new Error(`Unknown value for -s: "${s}". See usage.`);
  }
}
