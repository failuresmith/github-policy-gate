import { describe, expect, it } from 'vitest';

import { evaluateBody } from '../../src/predicates/body';
import { createFacts } from '../helpers/facts';

describe('evaluateBody', () => {
  it('passes when the PR body matches one pattern', () => {
    const result = evaluateBody(createFacts(), ['rollback', 'runbook']);

    expect(result.passed).toBe(true);
    expect(result.evidence[0]).toMatch(/rollback/i);
  });

  it('fails when no pattern matches', () => {
    const result = evaluateBody(createFacts(), ['security-review']);

    expect(result.passed).toBe(false);
  });
});
