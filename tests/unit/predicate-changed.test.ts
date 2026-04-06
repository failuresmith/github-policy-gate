import { describe, expect, it } from 'vitest';

import { evaluateChanged } from '../../src/predicates/changed';
import { createFacts } from '../helpers/facts';

describe('evaluateChanged', () => {
  it('passes when a changed file matches one of the globs', () => {
    const result = evaluateChanged(createFacts(), ['runtime/queue/**']);

    expect(result.passed).toBe(true);
    expect(result.evidence).toContain('runtime/queue/worker.ts');
  });

  it('fails when no changed file matches', () => {
    const result = evaluateChanged(createFacts(), ['tests/**']);

    expect(result.passed).toBe(false);
    expect(result.evidence).toEqual([]);
  });
});
