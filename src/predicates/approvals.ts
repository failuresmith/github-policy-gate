import type { PredicateOutcome } from '../engine/results';
import type { PolicyFacts } from '../facts/github-context';

export function evaluateApprovalCountAtLeast(
  facts: PolicyFacts,
  minimum: number,
): PredicateOutcome {
  return {
    passed: facts.approvalsCount >= minimum,
    evidence: [`approvals=${facts.approvalsCount}`, `minimum=${minimum}`],
  };
}
