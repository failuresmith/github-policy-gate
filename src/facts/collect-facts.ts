import * as github from '@actions/github';
import type { PolicyConfig } from '../config/schema';
import { countApprovals } from './approvals';
import { listChangedFiles } from './changed-files';
import {
  type GitHubClient,
  type PolicyFacts,
  requirePullRequestContext,
} from './github-context';
import {
  collectRepoRequirements,
  listRepoFiles,
  readRepoFileContents,
} from './repo-files';

export async function collectPolicyFacts(
  client: GitHubClient,
  config: PolicyConfig,
  workspace: string,
): Promise<PolicyFacts> {
  const pullRequest = requirePullRequestContext(github.context);
  const changedFiles = await listChangedFiles(client, pullRequest);
  const requirements = collectRepoRequirements(config);
  const repoFiles = requirements.needsRepoFiles
    ? await listRepoFiles(workspace)
    : [];
  const fileContents =
    requirements.fileContentGlobs.length > 0
      ? await readRepoFileContents(
          workspace,
          repoFiles,
          requirements.fileContentGlobs,
        )
      : {};
  return {
    changedFiles: changedFiles.all,
    addedFiles: changedFiles.added,
    removedFiles: changedFiles.removed,
    renamedFiles: changedFiles.renamed,
    prTitle: pullRequest.title,
    prBody: pullRequest.body,
    labels: pullRequest.labels,
    requestedReviewers: pullRequest.requestedReviewers,
    approvalsCount: await countApprovals(client, pullRequest),
    repoFiles,
    fileContents,
  };
}
