import type { GitHubClient, PullRequestContext } from './github-context';

export async function countApprovals(
  client: GitHubClient,
  pullRequest: PullRequestContext,
): Promise<number> {
  const reviews = (await client.paginate(client.rest.pulls.listReviews, {
    owner: pullRequest.owner,
    repo: pullRequest.repo,
    pull_number: pullRequest.number,
    per_page: 100,
  })) as Array<{ state: string; user?: { login?: string } }>;
  const states = new Map<string, string>();
  for (const review of reviews) {
    const login = review.user?.login;
    if (login === undefined) {
      continue;
    }
    states.set(login, review.state);
  }
  return [...states.values()].filter((state) => state === 'APPROVED').length;
}
