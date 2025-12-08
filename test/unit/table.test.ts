import { Summary } from '../../lib/summary.js';
import { tableData } from '../../lib/table.js';
import { makeTx } from './factories/transactionFactory.js';

describe('Table', () => {
  test('should return data with categories sorted alphabetically by default', () => {
    const txs = [makeTx({ category: 'CatB' }), makeTx({ category: 'CatA' })];
    const data = tableData(new Summary(txs), 'category');

    // Row 0 is header
    expect(data[1][0]).toContain('CatA');
    expect(data[2][0]).toContain('CatB');
  });

  test('should return data with categories sorted by amount descending if requested', () => {
    const txs = [
      makeTx({ category: 'CatB', amount: 10 }),
      makeTx({ category: 'CatA', amount: 20 }),
    ];
    const data = tableData(new Summary(txs), 'amount');

    // Row 0 is header
    expect(data[1][0]).toContain('CatA');
    expect(data[2][0]).toContain('CatB');
  });
});
