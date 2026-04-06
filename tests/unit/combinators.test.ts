import { describe, expect, it } from 'vitest';

import {
  combineAll,
  combineAny,
  combineNot,
} from '../../src/engine/combinators';

describe('combineAll', () => {
  it('passes when every outcome passes', () => {
    const result = combineAll([
      { passed: true, evidence: ['a'] },
      { passed: true, evidence: ['b'] },
    ]);

    expect(result.passed).toBe(true);
    expect(result.evidence).toEqual(['a', 'b']);
  });

  it('fails when one outcome fails', () => {
    const result = combineAll([
      { passed: true, evidence: ['a'] },
      { passed: false, evidence: ['missing'] },
    ]);

    expect(result.passed).toBe(false);
    expect(result.evidence).toContain('missing');
  });
});

describe('combineAny', () => {
  it('passes when one outcome passes', () => {
    const result = combineAny([
      { passed: false, evidence: ['missing tests'] },
      { passed: true, evidence: ['docs/runbooks/deploy.md'] },
    ]);

    expect(result.passed).toBe(true);
    expect(result.evidence).toContain('docs/runbooks/deploy.md');
  });

  it('fails when every outcome fails', () => {
    const result = combineAny([
      { passed: false, evidence: ['missing tests'] },
      { passed: false, evidence: ['missing docs'] },
    ]);

    expect(result.passed).toBe(false);
    expect(result.evidence).toEqual(['missing tests', 'missing docs']);
  });
});

describe('combineNot', () => {
  it('inverts the pass value and preserves evidence', () => {
    const result = combineNot({
      passed: true,
      evidence: ['label:skip-policy'],
    });

    expect(result.passed).toBe(false);
    expect(result.evidence).toEqual(['label:skip-policy']);
  });
});
