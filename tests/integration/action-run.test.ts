import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { runAction } from '../../src/action/main';
import type { ActionReporter } from '../../src/action/reporter';
import { createFacts } from '../helpers/facts';

describe('runAction', () => {
  it('uses the temporary default config in advisory mode when config is missing', async () => {
    const workspace = await fs.mkdtemp(
      path.join(os.tmpdir(), 'policy-gate-action-'),
    );
    const runnerTemp = await fs.mkdtemp(
      path.join(os.tmpdir(), 'policy-gate-runner-'),
    );
    const notices: string[] = [];

    const result = await runAction({
      inputs: { failOnWarn: false },
      cwd: workspace,
      runnerTemp,
      reporter: createReporter({ notices }),
      factsProvider: () => Promise.resolve(createFacts()),
    });

    expect(result.advisoryOnly).toBe(true);
    expect(notices.join('\n')).toMatch(/Generated.*advisory/i);

    await fs.rm(workspace, { recursive: true, force: true });
    await fs.rm(runnerTemp, { recursive: true, force: true });
  });

  it('fails the run when an error severity policy is violated', async () => {
    const workspace = await createWorkspaceWithConfig(`
policies:
  - id: queue-change-requires-tests
    severity: error
    when:
      changed:
        - "runtime/queue/**"
    require:
      changed:
        - "tests/**"
    message: Queue changes require tests.
`);
    const failures: string[] = [];

    const result = await runAction({
      inputs: {
        configPath: path.join(workspace, '.github/policy-gate.yml'),
        failOnWarn: false,
      },
      reporter: createReporter({ failures }),
      factsProvider: () => Promise.resolve(createFacts()),
    });

    expect(result.errorViolations).toBe(1);
    expect(failures[0]).toMatch(/Queue changes require tests/i);
  });

  it('does not fail for warnings unless fail-on-warn is enabled', async () => {
    const workspace = await createWorkspaceWithConfig(`
policies:
  - id: api-change-needs-changelog
    severity: warn
    when:
      changed:
        - "api/public/**"
    require:
      changed:
        - "docs/release-notes/**"
    message: API changes should include release-note evidence.
`);
    const failures: string[] = [];
    const warnings: string[] = [];

    const result = await runAction({
      inputs: {
        configPath: path.join(workspace, '.github/policy-gate.yml'),
        failOnWarn: false,
      },
      reporter: createReporter({ failures, warnings }),
      factsProvider: () => Promise.resolve(createFacts()),
    });

    expect(result.warningViolations).toBe(1);
    expect(failures).toEqual([]);
    expect(warnings[0]).toMatch(
      /API changes should include release-note evidence/i,
    );
  });
});

function createReporter(sink: {
  notices?: string[];
  warnings?: string[];
  errors?: string[];
  failures?: string[];
}): ActionReporter {
  return {
    info: () => undefined,
    notice: (message) => sink.notices?.push(message),
    warning: (message) => sink.warnings?.push(message),
    error: (message) => sink.errors?.push(message),
    fail: (message) => sink.failures?.push(message),
    annotate: () => undefined,
  };
}

async function createWorkspaceWithConfig(
  configSource: string,
): Promise<string> {
  const workspace = await fs.mkdtemp(
    path.join(os.tmpdir(), 'policy-gate-config-'),
  );
  const configDir = path.join(workspace, '.github');
  await fs.mkdir(configDir, { recursive: true });
  await fs.writeFile(
    path.join(configDir, 'policy-gate.yml'),
    configSource.trimStart(),
    'utf8',
  );
  return workspace;
}
