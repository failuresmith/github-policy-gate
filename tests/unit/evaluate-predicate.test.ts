import { describe, expect, it } from 'vitest';

import { evaluatePredicate } from '../../src/engine/evaluate-predicate';
import { createFacts } from '../helpers/facts';

describe('evaluatePredicate', () => {
  const facts = createFacts();

  it('dispatches exists predicates', () => {
    expect(evaluatePredicate({ exists: ['CHANGELOG.md'] }, facts).passed).toBe(
      true,
    );
  });

  it('dispatches title predicates', () => {
    expect(evaluatePredicate({ title: ['rollback'] }, facts).passed).toBe(true);
  });

  it('dispatches label predicates', () => {
    expect(
      evaluatePredicate({ has_label: ['release-note-exempt'] }, facts).passed,
    ).toBe(true);
  });

  it('dispatches approval count predicates', () => {
    expect(
      evaluatePredicate({ approval_count_at_least: 2 }, facts).passed,
    ).toBe(true);
  });

  it('dispatches file content predicates', () => {
    expect(
      evaluatePredicate(
        {
          file_contains: {
            globs: ['docs/runbooks/**'],
            patterns: ['Rollback'],
          },
        },
        facts,
      ).passed,
    ).toBe(true);
  });

  it('dispatches all and any combinators', () => {
    expect(
      evaluatePredicate(
        {
          all: [
            { changed: ['runtime/queue/**'] },
            { any: [{ changed: ['docs/**'] }, { pr_text: ['rollback'] }] },
          ],
        },
        facts,
      ).passed,
    ).toBe(true);
  });

  it('dispatches not combinators', () => {
    expect(
      evaluatePredicate({ not: { has_label: ['skip-policy'] } }, facts).passed,
    ).toBe(true);
  });
});
