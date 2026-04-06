import { describe, expect, it, vi } from 'vitest';

import { createGitHubReporter } from '../../src/action/reporter';

describe('createGitHubReporter', () => {
  it('emits annotations with the matching severity', () => {
    const core = {
      info: vi.fn(),
      notice: vi.fn(),
      warning: vi.fn(),
      error: vi.fn(),
      setFailed: vi.fn(),
    };
    const reporter = createGitHubReporter(core);

    reporter.info('summary');
    reporter.notice('notice');
    reporter.warning('warn log');
    reporter.error('error log');
    reporter.annotate({
      id: 'warn-rule',
      severity: 'warn',
      status: 'violated',
      message: 'warning text',
      whenEvidence: [],
      requireEvidence: [],
    });
    reporter.annotate({
      id: 'error-rule',
      severity: 'error',
      status: 'violated',
      message: 'error text',
      whenEvidence: [],
      requireEvidence: [],
    });
    reporter.fail('failed');

    expect(core.info).toHaveBeenCalledWith('summary');
    expect(core.notice).toHaveBeenCalledWith('notice');
    expect(core.warning).toHaveBeenCalledWith('warn log');
    expect(core.error).toHaveBeenCalledWith('error log');
    expect(core.warning).toHaveBeenCalledWith('[warn-rule] warning text', {
      title: 'Policy warn-rule',
    });
    expect(core.error).toHaveBeenCalledWith('[error-rule] error text', {
      title: 'Policy error-rule',
    });
    expect(core.setFailed).toHaveBeenCalledWith('failed');
  });
});
