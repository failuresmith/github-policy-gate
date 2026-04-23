# FAQ

## Why is this a GitHub Action instead of a bot?

Most policy enforcement tools require a hosted bot, a web server, and a database to store state. `github-policy-gate` is designed for teams that want **zero-infrastructure** guardrails. It runs entirely within your existing GitHub Actions environment, making it easier to trust and maintain.

## What happen if the config is missing?

The action follows a "fail-safe" approach. If `.github/policy-gate.yml` is not found, it generates a temporary advisory-only config under `RUNNER_TEMP`, logs the generated path, and keeps the job non-blocking. This ensures that new repositories can adopt the action without immediate breakage.

## Does it read the whole repository?

No. The action is performance-conscious. It only reads repository facts such as `exists` or `file_contains` when your active policies explicitly require them. File contents are read only for the specific files matched by your globs.

## Can warnings fail the job?

Yes. By default, only `severity: error` policies will fail the job. If you want `warn` violations to also fail the job, set the input `fail-on-warn: true`.

## What permissions does it need?

The action requires `contents: read` and `pull-requests: read` permissions. These are used to fetch the PR metadata and read the files in the repository.

```yaml
permissions:
  contents: read
  pull-requests: read
```

## Can I test policies locally?

Yes! Follow the [Local Development](../README.md#local-development) instructions. You can run the test suite to see how policies are evaluated.
