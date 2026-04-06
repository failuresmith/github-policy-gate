import type { PredicateOutcome } from '../engine/results';
import type { PolicyFacts } from '../facts/github-context';
import { findMatches } from '../utils/glob';
import { findMatchingPatterns } from '../utils/patterns';

export function evaluateFileContains(
  facts: PolicyFacts,
  globs: string[],
  patterns: string[],
): PredicateOutcome {
  const files = findMatches(facts.repoFiles, globs);
  const evidence = files.flatMap((file) => {
    const content = facts.fileContents[file];
    if (content === undefined) {
      return [];
    }
    return findMatchingPatterns(content, patterns).map(
      (pattern) => `${file} matched ${pattern}`,
    );
  });
  return { passed: evidence.length > 0, evidence };
}
