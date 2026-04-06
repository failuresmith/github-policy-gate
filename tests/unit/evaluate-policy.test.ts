import { describe, expect, it } from 'vitest';

import type { Policy } from '../../src/config/schema';
import { evaluatePolicy } from '../../src/engine/evaluate-policy';
import { createFacts } from '../helpers/facts';

describe('evaluatePolicy', () => {
  it('skips policies when the when clause does not match', () => {
    const policy: Policy = {
      id: 'docs-only',
      severity: 'warn',
      when: { changed: ['docs/**'] },
      require: { changed: ['README.md'] },
      message: 'docs-only',
    };

    const result = evaluatePolicy(policy, createFacts());

    expect(result.status).toBe('skipped');
    expect(result.id).toBe('docs-only');
  });

  it('passes when the policy triggers and the requirement passes', () => {
    const policy: Policy = {
      id: 'workflow-needs-runbook',
      severity: 'error',
      when: { changed: ['.github/workflows/**'] },
      require: {
        any: [{ changed: ['docs/runbooks/**'] }, { pr_text: ['rollback'] }],
      },
      message: 'Workflow changes require runbook evidence.',
    };

    const result = evaluatePolicy(policy, createFacts());

    expect(result.status).toBe('passed');
    expect(result.requireEvidence.length).toBeGreaterThan(0);
  });

  it('violates when the policy triggers and the requirement fails', () => {
    const policy: Policy = {
      id: 'queue-change-needs-tests',
      severity: 'error',
      when: { changed: ['runtime/queue/**'] },
      require: { changed: ['tests/**'] },
      message: 'Queue changes require tests.',
    };

    const result = evaluatePolicy(policy, createFacts());

    expect(result.status).toBe('violated');
    expect(result.message).toContain('Queue changes require tests.');
  });

  it('supports not combinators in requirements', () => {
    const policy: Policy = {
      id: 'forbid-skip-label',
      severity: 'warn',
      require: {
        not: { has_label: ['skip-policy'] },
      },
      message: 'skip-policy is not allowed',
    };

    const result = evaluatePolicy(policy, createFacts());

    expect(result.status).toBe('passed');
  });
});
