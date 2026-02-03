import { readFileSync } from 'fs';
import dayjs, { Dayjs } from '../date.js';
import { Output } from '../output.js';
import { Override, OverridesRepo } from '../transactions.js';

interface ProposedOverride {
  date: string;
  amount: number;
  category: string;
  comment?: string;
}

export class ImportOverridesCommand {
  constructor(
    private readonly inputPath: string,
    private readonly overridesRepo: OverridesRepo,
    private readonly existingOverrides: Override[],
    private readonly output: Output
  ) {}

  execute(): void {
    const proposed = loadProposed(this.inputPath);
    const toAdd = proposed
      .map(parseOverride)
      .filter((o) => !isDuplicate(o, this.existingOverrides));

    const merged = [...this.existingOverrides, ...toAdd];
    this.overridesRepo.saveAll(merged);

    const skipped = proposed.length - toAdd.length;
    this.output.log(`Added ${toAdd.length}, skipped ${skipped} duplicates`);
  }
}

function loadProposed(inputPath: string): ProposedOverride[] {
  const content = readFileSync(inputPath, 'utf8');
  return JSON.parse(content);
}

function parseOverride(p: ProposedOverride): Override {
  return {
    date: parseDate(p.date),
    amount: p.amount,
    category: p.category,
    comment: p.comment ?? '',
  };
}

function isDuplicate(override: Override, existing: Override[]): boolean {
  return existing.some(
    (e) => e.date.isSame(override.date) && e.amount === override.amount
  );
}

function parseDate(dateStr: string): Dayjs {
  if (dateStr.includes('T')) {
    return dayjs.utc(dateStr);
  }
  return dayjs.tz(dateStr, 'Europe/Zurich').utc();
}
