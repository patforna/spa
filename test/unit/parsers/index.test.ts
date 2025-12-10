import dayjs, { Dayjs } from '../../../lib/date.js';
import { parseCSV } from '../../../lib/parsers/index.js';

function parseDate(dateString: string): Dayjs {
  const parsed = parseCSV(csvFor(dateString));
  return parsed[0]['date'] as Dayjs;
}

function csvFor(date: string) {
  return `Date\n${date}`;
}

describe('parseCSV', () => {
  test('should parse Wise dates', () => {
    // YYYY-MM-DD HH:mm:ss
    expect(
      parseDate('2025-02-28 02:27:47').isSame(
        dayjs.tz('2025-02-28 02:27:47', 'Europe/Zurich')
      )
    ).toBe(true);
  });

  test('should parse ZKB dates', () => {
    // DD.MM.YYYY
    expect(
      parseDate('31.01.2025').isSame(dayjs.tz('2025-01-31', 'Europe/Zurich'))
    ).toBe(true);
  });

  test('should parse Viseca dates', () => {
    // MM/DD/YYYY HH:mm:ss
    expect(
      parseDate('03/17/2025 09:58:03').isSame(
        dayjs.tz('2025-03-17 09:58:03', 'Europe/Zurich')
      )
    ).toBe(true);
  });
});
