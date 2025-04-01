import _ from 'lodash';
import moment from 'moment';
import Papa from 'papaparse';
import { Item } from '../items.js';
import { FxRateService } from '../fxRates.js';
import { FKBInputParser } from './fkb.js';
import { WiseInputParser } from './wise.js';

export interface InputParser {
  parse(input: string): Promise<Item[]>;
}

export class InputParserFactory {
  constructor(private readonly fxRateService: FxRateService) {}

  createParser(input: string): InputParser {
    const firstLine = input.split('\n')[0].trim();

    if (firstLine.startsWith('Kontoauszug bis:')) {
      return new FKBInputParser();
    }

    if (firstLine.startsWith('ID,Status,Direction')) {
      return new WiseInputParser(this.fxRateService);
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
      const parsedDate = moment(
        value,
        [
          'YYYY-MM-DD HH:mm:ss', // wise
          'YYYY-MM-DD', // ?
          'DD.MM.YY', // fkb
          'DD/MM/YYYY HH:mm:ss', // viseca
        ],
        true
      );
      if (parsedDate.isValid()) {
        return parsedDate;
      }
      return value;
    },
  });

  return parsed.data;
}
