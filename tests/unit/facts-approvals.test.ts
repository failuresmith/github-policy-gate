import { describe, expect, it } from 'vitest';

import { countApprovals } from '../../src/facts/approvals';

describe('countApprovals', () => {
  it('counts reviewers whose latest review is approved', async () => {
    const approvals = await countApprovals(
      {
        paginate: () =>
          Promise.resolve([
            { state: 'APPROVED', user: { login: 'alice' } },
            { state: 'CHANGES_REQUESTED', user: { login: 'alice' } },
            { state: 'APPROVED', user: { login: 'bob' } },
          ]),
        rest: { pulls: { listReviews: {} } },
      } as never,
      {
        owner: 'acme',
        repo: 'demo',
        number: 1,
        title: '',
        body: '',
        labels: [],
        requestedReviewers: [],
      },
    );

    expect(approvals).toBe(1);
  });

  it('ignores reviews without a login', async () => {
    const approvals = await countApprovals(
      {
        paginate: () =>
          Promise.resolve([
            { state: 'APPROVED', user: {} },
            { state: 'APPROVED', user: { login: 'carol' } },
          ]),
        rest: { pulls: { listReviews: {} } },
      } as never,
      {
        owner: 'acme',
        repo: 'demo',
        number: 1,
        title: '',
        body: '',
        labels: [],
        requestedReviewers: [],
      },
    );

    expect(approvals).toBe(1);
  });
});
