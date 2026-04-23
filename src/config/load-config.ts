import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import yaml from 'js-yaml';

import {
  DEFAULT_CONFIG_PATH,
  createDefaultPolicyConfig,
  renderDefaultPolicyConfig,
} from './default-config';
import type { PolicyConfig } from './schema';
import { validateConfig } from './validate-config';

export interface LoadedConfig {
  config: PolicyConfig;
  advisoryOnly: boolean;
  generatedDefault: boolean;
  resolvedPath: string;
  notices: string[];
}

export interface LoadConfigOptions {
  cwd?: string | undefined;
  runnerTemp?: string | undefined;
}

export async function loadConfig(
  options: LoadConfigOptions = {},
): Promise<LoadedConfig> {
  const resolvedPath = path.resolve(
    options.cwd ?? process.cwd(),
    DEFAULT_CONFIG_PATH,
  );
  try {
    await fs.access(resolvedPath);
    return loadConfigFromPath(resolvedPath);
  } catch {
    return createTemporaryDefaultConfig(options);
  }
}

export async function loadConfigFromPath(
  configPath: string,
): Promise<LoadedConfig> {
  const resolvedPath = path.resolve(configPath);
  const source = await fs.readFile(resolvedPath, 'utf8');
  const parsed = yaml.load(source);
  return {
    config: validateConfig(parsed),
    advisoryOnly: false,
    generatedDefault: false,
    resolvedPath,
    notices: [],
  };
}

async function createTemporaryDefaultConfig(
  options: LoadConfigOptions,
): Promise<LoadedConfig> {
  const tempRoot =
    options.runnerTemp ?? process.env['RUNNER_TEMP'] ?? os.tmpdir();
  const resolvedPath = path.join(tempRoot, 'github-policy-gate.default.yml');
  await fs.writeFile(resolvedPath, renderDefaultPolicyConfig(), 'utf8');
  return {
    config: createDefaultPolicyConfig(),
    advisoryOnly: true,
    generatedDefault: true,
    resolvedPath,
    notices: [
      `No config found at ${DEFAULT_CONFIG_PATH}. Generated an advisory-only default config at ${resolvedPath}.`,
    ],
  };
}
