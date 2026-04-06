import { describe, expect, it } from 'vitest';

import { invariant } from '../../src/utils/invariant';
import { pluralize } from '../../src/utils/strings';

describe('utils', () => {
  it('pluralizes counts', () => {
    expect(pluralize(1, 'violation')).toBe('violation');
    expect(pluralize(2, 'violation')).toBe('violations');
  });

  it('throws when invariant conditions fail', () => {
    expect(() => invariant(false, 'broken')).toThrow('broken');
  });
});
