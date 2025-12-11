import _ from 'lodash';
import dayjs from '../date.js';
import Papa from 'papaparse';
import { FxRateService } from '../fxRates.js';
import { Transaction } from '../transactions.js';
import { VisecaInputParser } from './viseca.js';
import { WiseInputParser } from './wise.js';
import { ZKBInputParser } from './zkb.js';
import { RevolutInputParser } from './revolut.js';

export interface InputParser {
  parse(input: string): Promise<Transaction[]>;
}

export class JsonInputParser implements InputParser {
  async parse(input: string): Promise<Transaction[]> {
    const data = JSON.parse(input) as Array<Record<string, unknown>>;
    return data.map((row) => ({
      ...row,
      date: dayjs.utc(row['date'] as string),
    })) as Transaction[];
  }
}

export class InputParserFactory {
  constructor(private readonly fxRateService: FxRateService) {}

  createParser(input: string): InputParser {
    const firstLine = input.trimStart().split('\n')[0];

    if (firstLine.startsWith('[')) return new JsonInputParser();

    if (firstLine.startsWith('ID,Status,Direction'))
      return new WiseInputParser(this.fxRateService);

    if (firstLine.startsWith('Type,Product'))
      return new RevolutInputParser(this.fxRateService);

    if (firstLine.startsWith('"Date";"Booking text";'))
      return new ZKBInputParser();

    if (firstLine.startsWith('TransactionId,CardId'))
      return new VisecaInputParser();

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
      // attempt to parse the value as a date using multiple formats and return as dayjs object
      const formats = [
        'YYYY-MM-DD HH:mm:ss', // wise
        'DD.MM.YYYY', // zkb
        'MM/DD/YYYY HH:mm:ss', // viseca
      ];
      const parsedDate = dayjs(value, formats, true);
      if (parsedDate.isValid()) {
        // Interpret as Zurich time, then convert to UTC for internal use
        return parsedDate.tz('Europe/Zurich', true).utc();
      }
      return value;
    },
  });

  return parsed.data;
}
