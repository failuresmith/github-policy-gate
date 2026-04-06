import type { PredicateOutcome } from '../engine/results';
import type { PolicyFacts } from '../facts/github-context';
import { findMatchingPatterns } from '../utils/patterns';

export function evaluateTitle(
  facts: PolicyFacts,
  patterns: string[],
): PredicateOutcome {
  const evidence = findMatchingPatterns(facts.prTitle, patterns);
  return { passed: evidence.length > 0, evidence };
}
