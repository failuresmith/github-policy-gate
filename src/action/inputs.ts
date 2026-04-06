import * as core from '@actions/core';

export interface ActionInputs {
  configPath?: string;
  githubToken?: string;
  failOnWarn: boolean;
}

export interface InputReader {
  getInput(
    name: string,
    options?: { required?: boolean; trimWhitespace?: boolean },
  ): string;
}

export function readInputs(reader: InputReader = core): ActionInputs {
  const configPath = normalize(reader.getInput('config-path'));
  const githubToken = normalize(reader.getInput('github-token'));
  const inputs: ActionInputs = {
    failOnWarn: readBooleanInput(reader.getInput('fail-on-warn')),
  };
  if (configPath !== undefined) {
    inputs.configPath = configPath;
  }
  if (githubToken !== undefined) {
    inputs.githubToken = githubToken;
  }
  return inputs;
}

function normalize(value: string): string | undefined {
  return value.trim().length === 0 ? undefined : value.trim();
}

function readBooleanInput(value: string): boolean {
  return value.trim().toLowerCase() === 'true';
}
