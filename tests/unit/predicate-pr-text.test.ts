import { describe, expect, it } from 'vitest';

import { evaluatePrText } from '../../src/predicates/pr-text';
import { createFacts } from '../helpers/facts';

describe('evaluatePrText', () => {
  it('passes when the PR body matches one pattern', () => {
    const result = evaluatePrText(createFacts(), ['rollback', 'runbook']);

    expect(result.passed).toBe(true);
    expect(result.evidence[0]).toMatch(/rollback/i);
  });

  it('fails when no pattern matches', () => {
    const result = evaluatePrText(createFacts(), ['security-review']);

    expect(result.passed).toBe(false);
  });
});
