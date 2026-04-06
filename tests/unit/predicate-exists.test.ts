import { describe, expect, it } from 'vitest';

import { evaluateExists } from '../../src/predicates/exists';
import { createFacts } from '../helpers/facts';

describe('evaluateExists', () => {
  it('passes when a repo file matches', () => {
    const result = evaluateExists(createFacts(), ['CHANGELOG.md']);

    expect(result.passed).toBe(true);
    expect(result.evidence).toContain('CHANGELOG.md');
  });

  it('fails when no repo file matches', () => {
    const result = evaluateExists(createFacts(), ['docs/missing/**']);

    expect(result.passed).toBe(false);
  });
});
