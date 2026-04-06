# github-policy-gate

`github-policy-gate` is a GitHub Action for policy as code in pull request CI, with simple guardrails for safer merges, required files, labels, approvals, and evidence checks.

## Quick Start

```yaml
name: policy-gate

on:
  pull_request:

jobs:
  policy-gate:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: read
    steps:
      - uses: actions/checkout@v4
      - uses: failuresmith/github-policy-gate@v1
        with:
          github-token: ${{ github.token }}
```

Add `.github/policy-gate.yml` or start from [`.github/policy-gate.yml.example`](.github/policy-gate.yml.example):

```yaml
policies:
  - id: queue-change-requires-tests
    severity: error
    when:
      changed:
        - 'runtime/queue/**'
    require:
      changed:
        - 'tests/**'
    message: 'Queue changes require tests.'
```

If the config file is missing, the action generates a temporary advisory-only config under the runner temp directory and keeps the job non-blocking.

## Inputs

`config-path`: Optional path to the policy file. Default: `.github/policy-gate.yml`

`github-token`: GitHub token used to read pull request facts. Default: `${{ github.token }}`

`fail-on-warn`: Fail the job on warning-severity violations. Default: `false`

## Docs

- [Quick start](docs/quick-start.md)
- [Configuration reference](docs/configuration.md)
- [Policy examples](docs/policy-examples.md)
- [Architecture](docs/architecture.md)
- [FAQ](docs/faq.md)
- [Contributing](docs/contributing.md)
- [License](LICENSE)

## Local Development

```bash
make install
make check
make validate
make build
```

## Release

Keep `main` source-only. To publish, run the `release` workflow manually from `main`. The workflow reads the version from `package.json`, validates the repo, creates a release commit on the dedicated `release` branch with `dist/index.js`, tags `vX.Y.Z`, and moves `vX` so consumers can keep using `uses: failuresmith/github-policy-gate@v1`. The repository uses PolyForm Noncommercial 1.0.0.
