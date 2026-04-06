import type { Context } from '@actions/github/lib/context';
import type { GitHub } from '@actions/github/lib/utils';

export interface PolicyFacts {
  changedFiles: string[];
  addedFiles: string[];
  removedFiles: string[];
  renamedFiles: string[];
  prTitle: string;
  prBody: string;
  labels: string[];
  requestedReviewers: string[];
  approvalsCount: number;
  repoFiles: string[];
  fileContents: Record<string, string>;
}

export interface PullRequestContext {
  owner: string;
  repo: string;
  number: number;
  title: string;
  body: string;
  labels: string[];
  requestedReviewers: string[];
}

export type GitHubClient = InstanceType<typeof GitHub>;

export function requirePullRequestContext(
  context: Context,
): PullRequestContext {
  const pullRequest = context.payload.pull_request;
  if (pullRequest === undefined) {
    throw new Error('github-policy-gate only supports pull_request events.');
  }
  return {
    owner: context.repo.owner,
    repo: context.repo.repo,
    number: pullRequest.number,
    title: pullRequest.title ?? '',
    body: pullRequest.body ?? '',
    labels: pullRequest.labels
      .map((label: { name?: string }) => label.name)
      .filter(
        (label: string | undefined): label is string => label !== undefined,
      ),
    requestedReviewers: pullRequest.requested_reviewers.map(
      (reviewer: { login: string }) => reviewer.login,
    ),
  };
}
