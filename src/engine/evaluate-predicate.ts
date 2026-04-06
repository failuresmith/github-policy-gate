import type { PredicateExpression } from '../config/schema';
import type { PolicyFacts } from '../facts/github-context';
import { evaluateApprovalCountAtLeast } from '../predicates/approvals';
import { evaluateChanged } from '../predicates/changed';
import { evaluateExists } from '../predicates/exists';
import { evaluateFileContains } from '../predicates/file-contains';
import { evaluateHasLabel } from '../predicates/has-label';
import { evaluatePrText } from '../predicates/pr-text';
import { evaluateTitle } from '../predicates/title';

import { combineAll, combineAny, combineNot } from './combinators';

import type { PredicateOutcome } from './results';

export function evaluatePredicate(
  predicate: PredicateExpression,
  facts: PolicyFacts,
): PredicateOutcome {
  if ('changed' in predicate) {
    return evaluateChanged(facts, predicate.changed);
  }
  if ('exists' in predicate) {
    return evaluateExists(facts, predicate.exists);
  }
  if ('pr_text' in predicate) {
    return evaluatePrText(facts, predicate.pr_text);
  }
  if ('title' in predicate) {
    return evaluateTitle(facts, predicate.title);
  }
  if ('has_label' in predicate) {
    return evaluateHasLabel(facts, predicate.has_label);
  }
  if ('approval_count_at_least' in predicate) {
    return evaluateApprovalCountAtLeast(
      facts,
      predicate.approval_count_at_least,
    );
  }
  if ('file_contains' in predicate) {
    return evaluateFileContains(
      facts,
      predicate.file_contains.globs,
      predicate.file_contains.patterns,
    );
  }
  if ('all' in predicate) {
    return combineAll(
      predicate.all.map((entry) => evaluatePredicate(entry, facts)),
    );
  }
  if ('any' in predicate) {
    return combineAny(
      predicate.any.map((entry) => evaluatePredicate(entry, facts)),
    );
  }
  return combineNot(evaluatePredicate(predicate.not, facts));
}
