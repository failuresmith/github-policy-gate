import type { GitHubClient, PullRequestContext } from './github-context';

export interface ChangedFileFacts {
  all: string[];
  added: string[];
  removed: string[];
  renamed: string[];
}

export async function listChangedFiles(
  client: GitHubClient,
  pullRequest: PullRequestContext,
): Promise<ChangedFileFacts> {
  const files = (await client.paginate(client.rest.pulls.listFiles, {
    owner: pullRequest.owner,
    repo: pullRequest.repo,
    pull_number: pullRequest.number,
    per_page: 100,
  })) as Array<{ filename: string; status: string }>;
  return {
    all: files.map((file) => file.filename),
    added: files
      .filter((file) => file.status === 'added')
      .map((file) => file.filename),
    removed: files
      .filter((file) => file.status === 'removed')
      .map((file) => file.filename),
    renamed: files
      .filter((file) => file.status === 'renamed')
      .map((file) => file.filename),
  };
}
