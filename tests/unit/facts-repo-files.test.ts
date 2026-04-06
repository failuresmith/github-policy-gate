import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import {
  collectRepoRequirements,
  listRepoFiles,
  readRepoFileContents,
} from '../../src/facts/repo-files';

describe('repo-files', () => {
  const workspaces: string[] = [];

  afterEach(async () => {
    await Promise.all(
      workspaces.map((workspace) =>
        fs.rm(workspace, { recursive: true, force: true }),
      ),
    );
  });

  it('lists repo files while skipping ignored directories', async () => {
    const workspace = await createWorkspace();
    const files = await listRepoFiles(workspace);

    expect(files).toContain('src/index.ts');
    expect(files).not.toContain('node_modules/ignored.js');
    expect(files).not.toContain('.git/config');
  });

  it('reads only targeted file contents', async () => {
    const workspace = await createWorkspace();
    const repoFiles = await listRepoFiles(workspace);

    const contents = await readRepoFileContents(workspace, repoFiles, [
      'docs/**/*.md',
    ]);

    expect(Object.keys(contents)).toEqual(['docs/runbooks/deploy.md']);
    expect(contents['docs/runbooks/deploy.md']).toMatch(/Rollback/);
  });

  it('collects repo requirements from exists and file_contains predicates', () => {
    const requirements = collectRepoRequirements({
      policies: [
        {
          id: 'repo-checks',
          severity: 'error',
          when: { exists: ['README.md'] },
          require: {
            any: [
              {
                file_contains: {
                  globs: ['docs/**/*.md'],
                  patterns: ['Rollback'],
                },
              },
              { changed: ['tests/**'] },
            ],
          },
          message: 'need docs',
        },
      ],
    });

    expect(requirements.needsRepoFiles).toBe(true);
    expect(requirements.fileContentGlobs).toEqual(['docs/**/*.md']);
  });

  it('walks nested combinators and returns false when repo files are not needed', () => {
    const requirements = collectRepoRequirements({
      policies: [
        {
          id: 'no-repo-scan',
          severity: 'warn',
          require: {
            not: {
              all: [{ changed: ['src/**'] }, { has_label: ['infra'] }],
            },
          },
          message: 'no scan needed',
        },
      ],
    });

    expect(requirements).toEqual({
      needsRepoFiles: false,
      fileContentGlobs: [],
    });
  });

  async function createWorkspace(): Promise<string> {
    const workspace = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-files-'));
    workspaces.push(workspace);
    await fs.mkdir(path.join(workspace, 'src'), { recursive: true });
    await fs.mkdir(path.join(workspace, 'docs/runbooks'), { recursive: true });
    await fs.mkdir(path.join(workspace, 'node_modules'), { recursive: true });
    await fs.mkdir(path.join(workspace, '.git'), { recursive: true });
    await fs.writeFile(
      path.join(workspace, 'src/index.ts'),
      'export const value = 1;\n',
      'utf8',
    );
    await fs.writeFile(
      path.join(workspace, 'docs/runbooks/deploy.md'),
      'Rollback instructions live here.\n',
      'utf8',
    );
    await fs.writeFile(
      path.join(workspace, 'node_modules/ignored.js'),
      '',
      'utf8',
    );
    await fs.writeFile(path.join(workspace, '.git/config'), '', 'utf8');
    return workspace;
  }
});
