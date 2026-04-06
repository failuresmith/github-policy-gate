import type { PredicateOutcome } from './results';

export function combineAll(outcomes: PredicateOutcome[]): PredicateOutcome {
  return {
    passed: outcomes.every((outcome) => outcome.passed),
    evidence: outcomes.flatMap((outcome) => outcome.evidence),
  };
}

export function combineAny(outcomes: PredicateOutcome[]): PredicateOutcome {
  const passedOutcomes = outcomes.filter((outcome) => outcome.passed);
  return {
    passed: passedOutcomes.length > 0,
    evidence: (passedOutcomes.length > 0 ? passedOutcomes : outcomes).flatMap(
      (outcome) => outcome.evidence,
    ),
  };
}

export function combineNot(outcome: PredicateOutcome): PredicateOutcome {
  return {
    passed: !outcome.passed,
    evidence: outcome.evidence,
  };
}
