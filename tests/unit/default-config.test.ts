import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { DEFAULT_CONFIG_PATH } from '../../src/config/default-config';
import { loadConfig } from '../../src/config/load-config';

describe('loadConfig fallback', () => {
  const originalCwd = process.cwd();
  const originalRunnerTemp = process.env['RUNNER_TEMP'];

  afterEach(async () => {
    process.chdir(originalCwd);
    if (originalRunnerTemp === undefined) {
      delete process.env['RUNNER_TEMP'];
    } else {
      process.env['RUNNER_TEMP'] = originalRunnerTemp;
    }
  });

  it('uses a temporary advisory-only default when config is missing', async () => {
    const workspace = await fs.mkdtemp(
      path.join(os.tmpdir(), 'policy-gate-workspace-'),
    );
    const runnerTemp = await fs.mkdtemp(
      path.join(os.tmpdir(), 'policy-gate-runner-'),
    );

    process.chdir(workspace);
    process.env['RUNNER_TEMP'] = runnerTemp;

    const loaded = await loadConfig();

    expect(loaded.generatedDefault).toBe(true);
    expect(loaded.advisoryOnly).toBe(true);
    expect(loaded.resolvedPath.startsWith(runnerTemp)).toBe(true);
    expect(loaded.notices[0]).toContain(DEFAULT_CONFIG_PATH);
    await expect(fs.readFile(loaded.resolvedPath, 'utf8')).resolves.toContain(
      'policies:',
    );
  });
});
