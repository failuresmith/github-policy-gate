import { promises as fs } from 'node:fs';
import path from 'node:path';

import type { PolicyConfig, PredicateExpression } from '../config/schema';
import { findMatches } from '../utils/glob';

const IGNORED_DIRECTORIES = new Set([
  '.git',
  'node_modules',
  'dist',
  'coverage',
  'build',
]);

export interface RepoRequirements {
  needsRepoFiles: boolean;
  fileContentGlobs: string[];
}

export async function listRepoFiles(root: string): Promise<string[]> {
  return walk(root, root);
}

export async function readRepoFileContents(
  root: string,
  repoFiles: string[],
  globs: string[],
): Promise<Record<string, string>> {
  const matchedFiles = findMatches(repoFiles, globs);
  const entries = await Promise.all(
    matchedFiles.map(
      async (file) =>
        [file, await fs.readFile(path.join(root, file), 'utf8')] as const,
    ),
  );
  return Object.fromEntries(entries);
}

export function collectRepoRequirements(
  config: PolicyConfig,
): RepoRequirements {
  const fileContentGlobs = new Set<string>();
  let needsRepoFiles = false;
  for (const policy of config.policies) {
    visitPredicate(policy.when, fileContentGlobs, (value) => {
      needsRepoFiles = needsRepoFiles || value;
    });
    visitPredicate(policy.require, fileContentGlobs, (value) => {
      needsRepoFiles = needsRepoFiles || value;
    });
  }
  return { needsRepoFiles, fileContentGlobs: [...fileContentGlobs] };
}

async function walk(root: string, current: string): Promise<string[]> {
  const entries = await fs.readdir(current, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      if (entry.isDirectory()) {
        if (IGNORED_DIRECTORIES.has(entry.name)) {
          return [];
        }
        return walk(root, path.join(current, entry.name));
      }
      return [
        path
          .relative(root, path.join(current, entry.name))
          .replaceAll(path.sep, '/'),
      ];
    }),
  );
  return nested.flat();
}

function visitPredicate(
  predicate: PredicateExpression | undefined,
  fileContentGlobs: Set<string>,
  flag: (needsRepoFiles: boolean) => void,
): void {
  if (predicate === undefined) {
    return;
  }
  if ('exists' in predicate) {
    flag(true);
    return;
  }
  if ('file_contains' in predicate) {
    flag(true);
    predicate.file_contains.globs.forEach((glob) => fileContentGlobs.add(glob));
    return;
  }
  if ('all' in predicate) {
    predicate.all.forEach((entry) =>
      visitPredicate(entry, fileContentGlobs, flag),
    );
    return;
  }
  if ('any' in predicate) {
    predicate.any.forEach((entry) =>
      visitPredicate(entry, fileContentGlobs, flag),
    );
    return;
  }
  if ('not' in predicate) {
    visitPredicate(predicate.not, fileContentGlobs, flag);
  }
}
