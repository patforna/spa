import { glob } from 'glob';
import { promises as fs } from 'fs';
import { join } from 'path';

/**
 * Expands file paths, directories, and glob patterns into a deduplicated list of file paths.
 * - File paths are returned as is
 * - Directory paths will return all files within them
 * - Glob patterns are expanded to matching files
 */
export async function expandPaths(...patterns: string[]): Promise<string[]> {
  const results = new Set<string>();
  for (let pattern of patterns) {
    try {
      const stats = await fs.stat(pattern);
      if (stats.isFile()) {
        results.add(pattern);
        continue;
      }

      // turn directory path into glob pattern
      if (stats.isDirectory()) pattern = join(pattern, '*');
    } catch (err) {
      // Error was probably thrown because pattern was a glob, not a file/dir path
      // If not ENOENT error, re-throw
      if (err.code !== 'ENOENT') {
        throw err;
      }
    }

    // expand glob pattern
    const matches = await glob(pattern, { nodir: true });
    matches.forEach((match) => results.add(match));
  }

  return Array.from(results);
}
