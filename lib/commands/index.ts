import { Summary } from '../summary';
import { CategoryCommand } from './category';
import { JsonCommand } from './json';
import { TableCommand } from './table';
import { CategoriseCommand } from './categorise';
import { Item } from '../items';

export interface Args {
  file: string;
  category: string;
  json: boolean;
}

export interface Command {
  execute(items: Item[]): Promise<void>;
}

export function createCommands(args: Args): Command[] {
  let cmds = [new CategoriseCommand()];

  if (args.category) {
    cmds.push(new CategoryCommand(args.category));
    return cmds;
  }

  cmds.push(args.json ? new JsonCommand() : new TableCommand());

  return cmds;
}
