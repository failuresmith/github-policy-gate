import * as core from '@actions/core';

import type { PolicyEvaluation } from '../engine/results';

export interface ActionReporter {
  info(message: string): void;
  notice(message: string): void;
  warning(message: string): void;
  error(message: string): void;
  fail(message: string): void;
  annotate(evaluation: PolicyEvaluation): void;
}

export interface ReporterCore {
  info(message: string): void;
  notice(message: string): void;
  warning(message: string, properties?: core.AnnotationProperties): void;
  error(message: string, properties?: core.AnnotationProperties): void;
  setFailed(message: string | Error): void;
}

export function createGitHubReporter(
  reporterCore: ReporterCore = core,
): ActionReporter {
  return {
    info: (message) => reporterCore.info(message),
    notice: (message) => reporterCore.notice(message),
    warning: (message) => reporterCore.warning(message),
    error: (message) => reporterCore.error(message),
    fail: (message) => reporterCore.setFailed(message),
    annotate: (evaluation) => annotateEvaluation(reporterCore, evaluation),
  };
}

function annotateEvaluation(
  reporterCore: ReporterCore,
  evaluation: PolicyEvaluation,
): void {
  const message = `[${evaluation.id}] ${evaluation.message}`;
  const properties = { title: `Policy ${evaluation.id}` };
  if (evaluation.severity === 'error') {
    reporterCore.error(message, properties);
    return;
  }
  reporterCore.warning(message, properties);
}
