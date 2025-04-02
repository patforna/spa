import moment from 'moment';
import { parseCSV } from '../../lib/parsers/index.js';

function parseDate(dateString: string): moment.Moment {
  const parsed = parseCSV(csvFor(dateString));
  return parsed[0]['date'] as moment.Moment;
}

function csvFor(date: string) {
  return `Date\n${date}`;
}

describe('parseCSV', () => {
  test('should parse FKB dates', () => {
    // DD.MM.YY
    expect(parseDate('01.02.23').isSame('2023-02-01')).toBe(true);
  });

  test('should parse Wise dates', () => {
    // YYYY-MM-DD HH:mm:ss
    expect(parseDate('2025-02-28 02:27:47').isSame('2025-02-28 02:27:47')).toBe(
      true
    );
  });

  test('should parse ZKB dates', () => {
    // DD.MM.YYYY
    expect(parseDate('31.01.2025').isSame('2025-01-31')).toBe(true);
  });

  test('should parse Viseca dates', () => {
    // MM/DD/YYYY HH:mm:ss
    expect(parseDate('03/17/2025 09:58:03').isSame('2025-03-17 09:58:03')).toBe(
      true
    );
  });
});
