import { describe, expect, it } from 'vitest';

import { evaluateFileContains } from '../../src/predicates/file-contains';
import { createFacts } from '../helpers/facts';

describe('evaluateFileContains', () => {
  it('passes when a targeted file contains a matching pattern', () => {
    const result = evaluateFileContains(
      createFacts(),
      ['docs/runbooks/**'],
      ['rollback'],
    );

    expect(result.passed).toBe(true);
    expect(result.evidence[0]).toContain('docs/runbooks/deploy.md');
  });

  it('fails when matching files do not contain the pattern', () => {
    const result = evaluateFileContains(
      createFacts(),
      ['api/public/**'],
      ['deprecation'],
    );

    expect(result.passed).toBe(false);
  });

  it('ignores matching files whose content was not loaded', () => {
    const result = evaluateFileContains(
      createFacts({ fileContents: {} }),
      ['docs/runbooks/**'],
      ['rollback'],
    );

    expect(result).toEqual({ passed: false, evidence: [] });
  });
});
