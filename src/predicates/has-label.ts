import type { PredicateOutcome } from '../engine/results';
import type { PolicyFacts } from '../facts/github-context';

export function evaluateHasLabel(
  facts: PolicyFacts,
  labels: string[],
): PredicateOutcome {
  const evidence = labels.filter((label) => facts.labels.includes(label));
  return { passed: evidence.length > 0, evidence };
}
