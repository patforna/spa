import { Summary } from '../summary';
import { CategoryCommand } from './category';
import { JsonCommand } from './json';
import { TableCommand } from './table';
import { UncategorisedCommand } from './uncategorised';

export interface Args {
  file: string;
  category: string;
  json: boolean;
}

export interface Command {
  execute(summary: Summary): Promise<void>;
}

export function createCommands(args: Args): Command[] {
  let cmds = [new UncategorisedCommand()];

  if (args.category) {
    cmds.push(new CategoryCommand(args.category));
    return cmds;
  }

  cmds.push(args.json ? new JsonCommand() : new TableCommand());

  return cmds;
}
