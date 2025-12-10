import { Categoriser, NO_CATEGORY, IGNORE } from '../../lib/categoriser.js';
import { Rules } from '../../lib/rules.js';
import { makeTx } from './factories/transactionFactory.js';
import dayjs from '../../lib/date.js';

describe('Categoriser', () => {
  it('should set NO_CATEGORY when no rules or overrides matches', () => {
    const categoriser = new Categoriser({}, []);
    const tx = makeTx();

    categoriser.categorise(tx);

    expect(tx.category).toBe(NO_CATEGORY);
  });

  it('should categorise using rules', () => {
    const rules: Rules = { groceries: [/migros/i] };
    const categoriser = new Categoriser(rules, []);
    const tx = makeTx({ description: 'MIGROS ZÜRICH' });

    categoriser.categorise(tx);

    expect(tx.category).toBe('groceries');
  });

  it('should throw error when multiple categories match', () => {
    const rules: Rules = {
      groceries: [/migros/i],
      shopping: [/migros/i],
    };
    const categoriser = new Categoriser(rules, []);
    const tx = makeTx({ description: 'MIGROS' });

    expect(() => categoriser.categorise(tx)).toThrow(/Multiple categories/);
  });

  it('should ignore, even when multiple categories match', () => {
    const rules: Rules = {
      groceries: [/coop/i],
      ignore: [/coop.*tankstelle/i],
    };
    const categoriser = new Categoriser(rules, []);
    const tx = makeTx({ description: 'COOP TANKSTELLE' });

    categoriser.categorise(tx);

    expect(tx.category).toBe(IGNORE);
  });

  it('should use override when date and amount match', () => {
    const date = dayjs('2024-01-15');
    const override = makeTx({ date, amount: -50, category: 'health' });
    const categoriser = new Categoriser({}, [override]);
    const tx = makeTx({ date, amount: -50, description: 'SOME MERCHANT' });

    categoriser.categorise(tx);

    expect(tx.category).toBe('health');
  });

  it('should use overrides over rules', () => {
    const date = dayjs('2024-01-15');
    const rules: Rules = { groceries: [/migros/i] };
    const override = makeTx({ date, amount: -100, category: 'other' });
    const categoriser = new Categoriser(rules, [override]);
    const tx = makeTx({ date, amount: -100, description: 'MIGROS' });

    categoriser.categorise(tx);

    expect(tx.category).toBe('other');
  });
});
