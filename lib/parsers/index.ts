import _ from 'lodash';
import moment from 'moment-timezone';
import Papa from 'papaparse';
import { FxRateService } from '../fxRates.js';
import { Item } from '../items.js';
import { AdditionalInputParser } from './additionals.js';
import { FKBInputParser } from './fkb.js';
import { VisecaInputParser } from './viseca.js';
import { WiseInputParser } from './wise.js';
import { ZKBInputParser } from './zkb.js';
import { RevolutInputParser } from './revolut.js';

export interface InputParser {
  parse(input: string): Promise<Item[]>;
}

export class InputParserFactory {
  constructor(private readonly fxRateService: FxRateService) {}

  createParser(input: string): InputParser {
    const firstLine = input.trimStart().split('\n')[0];

    if (firstLine.startsWith('Kontoauszug bis:')) return new FKBInputParser();

    if (firstLine.startsWith('ID,Status,Direction'))
      return new WiseInputParser(this.fxRateService);

    if (firstLine.startsWith('Type,Product')) return new RevolutInputParser();

    if (firstLine.startsWith('"Date";"Booking text";'))
      return new ZKBInputParser();

    if (firstLine.startsWith('TransactionId,CardId'))
      return new VisecaInputParser();

    if (input.trimStart().startsWith('[')) {
      return new AdditionalInputParser();
    }

    throw new Error('Unknown Input format');
  }
}

/**
 * Parses a CSV string into an array of objects with automatic type conversion.
 * Handles date parsing for multiple formats and converts headers to camelCase.
 * @param input - The CSV string to parse
 * @returns Array of parsed objects with typed values
 */
export function parseCSV(input: string): object[] {
  const parsed = Papa.parse(input, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    transformHeader: _.camelCase,
    transform: (value: string) => {
      // attempt to parse the value as a date using multiple formats and return as moment object
      const parsedDate = moment.tz(
        value,
        [
          'DD.MM.YY', // fkb
          'YYYY-MM-DD HH:mm:ss', // wise
          'DD.MM.YYYY', // zkb
          'MM/DD/YYYY HH:mm:ss', // viseca
        ],
        true,
        'Europe/Zurich' // since we don't know the input TZ, we assume date/times are in Zurich
      );
      if (parsedDate.isValid()) {
        return parsedDate;
      }
      return value;
    },
  });

  return parsed.data;
}
