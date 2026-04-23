import type { PredicateOutcome } from '../engine/results';
import type { PolicyFacts } from '../facts/github-context';
import { findMatchingPatterns } from '../utils/patterns';

export function evaluateBody(
  facts: PolicyFacts,
  patterns: string[],
): PredicateOutcome {
  const evidence = findMatchingPatterns(facts.prBody, patterns);
  return { passed: evidence.length > 0, evidence };
}
