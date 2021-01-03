import stringify from 'json-stringify-pretty-compact';
import { NO_CATEGORY } from './categoriser.js';
import { Item } from './items.js';
import { Summary } from './summary';
import { tableFrom } from './table.js';

export interface Args {
  file: string;
  category: string;
  json: boolean;
}

export interface Command {
  execute(summary: Summary): void;
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

class UncategorisedCommand implements Command {
  execute(summary: Summary): void {
    summary
      .itemsForCategory(NO_CATEGORY)
      .forEach((item) => console.log(asString(item)));
  }
}

class CategoryCommand implements Command {
  #category: string;
  constructor(category: string) {
    this.#category = category;
  }

  execute(summary: Summary): void {
    summary
      .itemsForCategory(this.#category)
      .forEach((item) => console.log(asString(item)));
  }
}

class JsonCommand implements Command {
  execute(summary: Summary): void {
    console.log(stringify(summary.data));
  }
}

class TableCommand implements Command {
  execute(summary: Summary): void {
    console.log(tableFrom(summary));
  }
}

const asString = (item: Item): string => {
  return `${item.date.format('DD.MM.YYYY')} ${item.description} ${item.amount}`;
};
