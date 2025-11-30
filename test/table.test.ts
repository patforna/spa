import { Summary } from '../lib/summary.js';
import { tableData } from '../lib/table.js';
import { makeItem } from './factories/itemFactory.js';

describe('Table', () => {
  test('should return data with categories sorted alphabetically by default', () => {
    const items = [
      makeItem({ category: 'CatB' }),
      makeItem({ category: 'CatA' }),
    ];
    const data = tableData(new Summary(items), 'category');

    // Row 0 is header
    expect(data[1][0]).toContain('CatA');
    expect(data[2][0]).toContain('CatB');
  });

  test('should return data with categories sorted by amount descending if requested', () => {
    const items = [
      makeItem({ category: 'CatB', amount: 10 }),
      makeItem({ category: 'CatA', amount: 20 }),
    ];
    const data = tableData(new Summary(items), 'amount');

    // Row 0 is header
    expect(data[1][0]).toContain('CatA');
    expect(data[2][0]).toContain('CatB');
  });
});
