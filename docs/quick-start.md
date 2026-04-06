# Quick Start

## 1. Add the action

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

## 2. Add a config

Copy [`.github/policy-gate.yml.example`](../.github/policy-gate.yml.example) to `.github/policy-gate.yml`.

Minimal starting point:

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

## 3. Open a pull request

The action reads pull request facts, evaluates every policy, prints a short summary, annotates violations, and fails only when `error` policies are violated.

## 4. Missing config behavior

If no config exists, the action generates a temporary advisory-only config under `RUNNER_TEMP`, logs the generated path, and keeps the job non-blocking.
