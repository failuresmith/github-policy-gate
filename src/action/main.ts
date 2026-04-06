import type { PolicyConfig } from '../config/schema';
import { loadConfig, loadConfigFromPath } from '../config/load-config';
import { evaluatePolicy } from '../engine/evaluate-policy';
import { countApprovals } from '../facts/approvals';
import { listChangedFiles } from '../facts/changed-files';
import {
  collectRepoRequirements,
  listRepoFiles,
  readRepoFileContents,
} from '../facts/repo-files';
import {
  type GitHubClient,
  type PolicyFacts,
  requirePullRequestContext,
} from '../facts/github-context';

import { readInputs, type ActionInputs } from './inputs';
import { createGitHubReporter, type ActionReporter } from './reporter';
import * as github from '@actions/github';

export interface ActionRunResult {
  advisoryOnly: boolean;
  errorViolations: number;
  warningViolations: number;
}

export interface ActionDependencies {
  inputs: ActionInputs;
  reporter: ActionReporter;
  factsProvider: (config: PolicyConfig) => Promise<PolicyFacts>;
  cwd?: string;
  runnerTemp?: string;
}

export async function runAction(
  dependencies: ActionDependencies,
): Promise<ActionRunResult> {
  const loaded = await readConfig(dependencies);
  for (const notice of loaded.notices) {
    dependencies.reporter.notice(notice);
  }

  const facts = await dependencies.factsProvider(loaded.config);
  const evaluations = loaded.config.policies.map((policy) =>
    evaluatePolicy(policy, facts),
  );
  const errorViolations = countViolations(evaluations, 'error');
  const warningViolations = countViolations(evaluations, 'warn');

  reportEvaluations(dependencies.reporter, evaluations);
  dependencies.reporter.info(
    `Policy summary: ${errorViolations} error violation(s), ${warningViolations} warning violation(s).`,
  );

  if (
    shouldFail(
      errorViolations,
      warningViolations,
      dependencies.inputs.failOnWarn,
    )
  ) {
    dependencies.reporter.fail(createFailureMessage(evaluations));
  }

  return {
    advisoryOnly: loaded.advisoryOnly,
    errorViolations,
    warningViolations,
  };
}

async function readConfig(
  dependencies: ActionDependencies,
): Promise<Awaited<ReturnType<typeof loadConfig>>> {
  const configPath = dependencies.inputs.configPath;
  if (configPath !== undefined) {
    return loadConfigFromPath(configPath);
  }
  const options: { cwd?: string; runnerTemp?: string } = {};
  if (dependencies.cwd !== undefined) {
    options.cwd = dependencies.cwd;
  }
  if (dependencies.runnerTemp !== undefined) {
    options.runnerTemp = dependencies.runnerTemp;
  }
  return loadConfig(options);
}

function countViolations(
  evaluations: ReturnType<typeof evaluatePolicy>[],
  severity: 'error' | 'warn',
): number {
  return evaluations.filter(
    (evaluation) =>
      evaluation.status === 'violated' && evaluation.severity === severity,
  ).length;
}

function reportEvaluations(
  reporter: ActionReporter,
  evaluations: ReturnType<typeof evaluatePolicy>[],
): void {
  for (const evaluation of evaluations) {
    if (evaluation.status !== 'violated') {
      continue;
    }
    reporter.annotate(evaluation);
    const message = `[${evaluation.id}] ${evaluation.message}`;
    if (evaluation.severity === 'error') {
      reporter.error(message);
      continue;
    }
    reporter.warning(message);
  }
}

function shouldFail(
  errorViolations: number,
  warningViolations: number,
  failOnWarn: boolean,
): boolean {
  return errorViolations > 0 || (failOnWarn && warningViolations > 0);
}

function createFailureMessage(
  evaluations: ReturnType<typeof evaluatePolicy>[],
): string {
  const violated = evaluations.filter(
    (evaluation) => evaluation.status === 'violated',
  );
  return violated
    .map((evaluation) => `[${evaluation.id}] ${evaluation.message}`)
    .join('\n');
}

export async function main(): Promise<void> {
  const inputs = readInputs();
  const reporter = createGitHubReporter();
  try {
    const workspace = process.env['GITHUB_WORKSPACE'] ?? process.cwd();
    const dependencies: ActionDependencies = {
      inputs,
      reporter,
      cwd: workspace,
      factsProvider: createGitHubFactsProvider(inputs, workspace),
    };
    const runnerTemp = process.env['RUNNER_TEMP'];
    if (runnerTemp !== undefined) {
      dependencies.runnerTemp = runnerTemp;
    }
    await runAction(dependencies);
  } catch (error) {
    reporter.fail(formatError(error));
  }
}

function createGitHubFactsProvider(
  inputs: ActionInputs,
  workspace: string,
): (config: PolicyConfig) => Promise<PolicyFacts> {
  const token = inputs.githubToken ?? process.env['GITHUB_TOKEN'];
  if (token === undefined || token.trim().length === 0) {
    throw new Error('github-token input is required for pull request facts.');
  }
  const client = github.getOctokit(token);
  return async (config) => collectPolicyFacts(client, config, workspace);
}

async function collectPolicyFacts(
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

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
