import type { PolicyConfig } from '../config/schema';
import { loadConfig, loadConfigFromPath } from '../config/load-config';
import { evaluatePolicy } from '../engine/evaluate-policy';
import { collectPolicyFacts } from '../facts/collect-facts';
import { type PolicyFacts } from '../facts/github-context';

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
  cwd?: string | undefined;
  runnerTemp?: string | undefined;
}

/**
 * Main action orchestration logic.
 */
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
  return loadConfig({
    cwd: dependencies.cwd,
    runnerTemp: dependencies.runnerTemp,
  });
}

function countViolations(
  evaluations: ReturnType<typeof evaluatePolicy>[],
  severity: 'error' | 'warn',
): number {
  return evaluations.filter(
    (e) => e.status === 'violated' && e.severity === severity,
  ).length;
}

function reportEvaluations(
  reporter: ActionReporter,
  evaluations: ReturnType<typeof evaluatePolicy>[],
): void {
  for (const evaluation of evaluations.filter((e) => e.status === 'violated')) {
    reporter.annotate(evaluation);
    const message = `[${evaluation.id}] ${evaluation.message}`;
    if (evaluation.severity === 'error') {
      reporter.error(message);
    } else {
      reporter.warning(message);
    }
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
  return evaluations
    .filter((e) => e.status === 'violated')
    .map((e) => `[${e.id}] ${e.message}`)
    .join('\n');
}

/**
 * Entry point for the GitHub Action.
 */
export async function main(): Promise<void> {
  const inputs = readInputs();
  const reporter = createGitHubReporter();

  try {
    const workspace = process.env['GITHUB_WORKSPACE'] ?? process.cwd();
    const dependencies: ActionDependencies = {
      inputs,
      reporter,
      cwd: workspace,
      runnerTemp: process.env['RUNNER_TEMP'],
      factsProvider: async (config) => {
        const token = inputs.githubToken ?? process.env['GITHUB_TOKEN'];
        if (!token?.trim()) {
          throw new Error(
            'github-token input is required for pull request facts.',
          );
        }
        const client = github.getOctokit(token);
        return collectPolicyFacts(client, config, workspace);
      },
    };

    await runAction(dependencies);
  } catch (error) {
    reporter.fail(error instanceof Error ? error.message : String(error));
  }
}
