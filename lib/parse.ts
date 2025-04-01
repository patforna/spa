// import autoParse from 'auto-parse';
// import _ from 'lodash';
// import Papa from 'papaparse';
// import moment from 'moment';
// import { Item, parseCard } from './items.js';

// export interface InputParser {
//   parse(input: string): Item[];
// }

// export class FKBInputParser implements InputParser {
//   private static readonly FIRST_ROW_NUMBER = 12;
//   private static readonly COLS = ['date', 'description', 'amount', 'valuta'];
//   private static readonly DATE_FORMAT = 'DD.MM.YY';

//   parse(input: string): Item[] {
//     return input
//       .split(/\r?\n/)
//       .splice(FKBInputParser.FIRST_ROW_NUMBER)
//       .filter((x) => x.length > 0)
//       .map((r) => this.parseRowItem(r));
//   }

//   private parseRowItem(row: string): Item {
//     const item = row.split(';').reduce(
//       (res, val, i) => ({
//         ...res,
//         ...{ [FKBInputParser.COLS[i]]: autoParse(val) },
//       }),
//       {}
//     ) as Item;

//     item.date = moment.utc(item.date, FKBInputParser.DATE_FORMAT);
//     item.card = parseCard(item.description);
//     item.valuta = moment.utc(item.valuta, FKBInputParser.DATE_FORMAT);
//     return item;
//   }
// }

// export class WiseInputParser implements InputParser {
//   parse(input: string): Item[] {
//     // TODO: Implement Wise parsing logic
//     return [];
//   }
// }

// export class InputParserFactory {
//   createParser(input: string): InputParser {
//     // TODO: Implement parser selection logic
//     return new FKBInputParser();
//   }
// }

// // Keep the generic parse function as it might be useful for other purposes
// export function parse(input: string): object[] {
//   const parsed = Papa.parse(input, {
//     header: true,
//     dynamicTyping: true,
//     skipEmptyLines: true,
//     transformHeader: _.camelCase,
//     transform: (value: string) => {
//       // attempt to parse the value as a date using multiple formats
//       const parsedDate = moment(
//         value,
//         ['YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD', 'DD.MM.YY'],
//         true
//       );
//       if (parsedDate.isValid()) {
//         return parsedDate;
//       }
//       return value;
//     },
//   });

//   return parsed.data;
// }
