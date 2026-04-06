import { describe, expect, it } from 'vitest';

import { evaluateApprovalCountAtLeast } from '../../src/predicates/approvals';
import { createFacts } from '../helpers/facts';

describe('evaluateApprovalCountAtLeast', () => {
  it('passes when approvals meet the minimum', () => {
    const result = evaluateApprovalCountAtLeast(createFacts(), 2);

    expect(result.passed).toBe(true);
    expect(result.evidence[0]).toContain('2');
  });

  it('fails when approvals are below the minimum', () => {
    const result = evaluateApprovalCountAtLeast(
      createFacts({ approvalsCount: 1 }),
      2,
    );

    expect(result.passed).toBe(false);
  });
});
