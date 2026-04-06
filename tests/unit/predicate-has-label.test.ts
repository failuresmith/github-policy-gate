import { describe, expect, it } from 'vitest';

import { evaluateHasLabel } from '../../src/predicates/has-label';
import { createFacts } from '../helpers/facts';

describe('evaluateHasLabel', () => {
  it('passes when one expected label exists', () => {
    const result = evaluateHasLabel(createFacts(), [
      'release-note-exempt',
      'safe-to-merge',
    ]);

    expect(result.passed).toBe(true);
    expect(result.evidence).toContain('release-note-exempt');
  });

  it('fails when labels do not match', () => {
    const result = evaluateHasLabel(createFacts(), ['security-review']);

    expect(result.passed).toBe(false);
  });
});
