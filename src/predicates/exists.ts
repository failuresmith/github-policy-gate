import type { PredicateOutcome } from '../engine/results';
import type { PolicyFacts } from '../facts/github-context';
import { findMatches } from '../utils/glob';

export function evaluateExists(
  facts: PolicyFacts,
  globs: string[],
): PredicateOutcome {
  const evidence = findMatches(facts.repoFiles, globs);
  return { passed: evidence.length > 0, evidence };
}
