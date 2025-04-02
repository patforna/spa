import { expandPaths } from '../lib/utils.js';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { rmSync } from 'fs';

describe('expandFilePaths', () => {
  const testDir = 'test/temp';
  const file1 = join(testDir, 'file1.csv');
  const file2 = join(testDir, 'file2.csv');
  const file3 = join(testDir, 'file3.json');

  beforeAll(() => {
    mkdirSync(testDir, { recursive: true });

    writeFileSync(file1, '');
    writeFileSync(file2, '');
    writeFileSync(file3, '');
  });

  afterAll(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  test('should handle single file', async () => {
    const result = await expandPaths(file1);
    expect(result).toEqual([file1]);
  });

  test('should handle multiple files', async () => {
    const result = await expandPaths(file1, file2);
    expect(result).toHaveLength(2);
    expect(result).toEqual(expect.arrayContaining([file1, file2]));
  });

  test('should handle directory and include all files', async () => {
    const result = await expandPaths(testDir);
    expect(result).toHaveLength(3);
    expect(result).toEqual(expect.arrayContaining([file1, file2, file3]));
  });

  test('should handle glob pattern', async () => {
    const result = await expandPaths(join(testDir, '*.csv'));
    expect(result).toHaveLength(2);
    expect(result).toEqual(expect.arrayContaining([file1, file2]));
  });
});
