import type { PolicyFacts } from '../../src/facts/github-context';

export function createFacts(overrides: Partial<PolicyFacts> = {}): PolicyFacts {
  return {
    changedFiles: [
      'runtime/queue/worker.ts',
      'api/public/index.ts',
      '.github/workflows/deploy.yml',
    ],
    addedFiles: ['docs/runbooks/deploy.md'],
    removedFiles: [],
    renamedFiles: ['docs/old.md -> docs/new.md'],
    prTitle: 'Add rollback plan for deploy pipeline',
    prBody: 'This PR adds a rollback guide and release note context.',
    labels: ['infra', 'release-note-exempt'],
    requestedReviewers: ['platform-team'],
    approvalsCount: 2,
    repoFiles: [
      'README.md',
      'CHANGELOG.md',
      'docs/runbooks/deploy.md',
      'api/public/index.ts',
      'src/auth/service.ts',
    ],
    fileContents: {
      'CHANGELOG.md': '## Unreleased\n- Added a new public API entry.\n',
      'docs/runbooks/deploy.md': 'Rollback steps are documented here.',
      'api/public/index.ts': 'export const version = "1.0.0";',
      'src/auth/service.ts': 'const token = process.env.AUTH_TOKEN;',
    },
    ...overrides,
  };
}
