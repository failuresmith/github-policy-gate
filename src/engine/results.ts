export interface PredicateOutcome {
  passed: boolean;
  evidence: string[];
}

export type PolicyStatus = 'passed' | 'skipped' | 'violated';

export interface PolicyEvaluation {
  id: string;
  severity: 'error' | 'warn';
  status: PolicyStatus;
  message: string;
  description?: string;
  whenEvidence: string[];
  requireEvidence: string[];
}
