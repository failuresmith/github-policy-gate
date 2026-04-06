import type { Policy } from '../config/schema';
import type { PolicyFacts } from '../facts/github-context';

import { evaluatePredicate } from './evaluate-predicate';
import type { PolicyEvaluation } from './results';

export function evaluatePolicy(
  policy: Policy,
  facts: PolicyFacts,
): PolicyEvaluation {
  const whenOutcome =
    policy.when === undefined
      ? undefined
      : evaluatePredicate(policy.when, facts);
  if (whenOutcome !== undefined && !whenOutcome.passed) {
    return withDescription(policy.description, {
      id: policy.id,
      severity: policy.severity,
      status: 'skipped',
      message: policy.message,
      whenEvidence: whenOutcome.evidence,
      requireEvidence: [],
    });
  }

  const requireOutcome = evaluatePredicate(policy.require, facts);
  return withDescription(policy.description, {
    id: policy.id,
    severity: policy.severity,
    status: requireOutcome.passed ? 'passed' : 'violated',
    message: policy.message,
    whenEvidence: whenOutcome?.evidence ?? [],
    requireEvidence: requireOutcome.evidence,
  });
}

function withDescription(
  description: string | undefined,
  evaluation: Omit<PolicyEvaluation, 'description'>,
): PolicyEvaluation {
  return description === undefined
    ? evaluation
    : { ...evaluation, description };
}
