# Quick Start

Get your pull request guardrails up and running in minutes.

## 1. Add the Workflow

Create `.github/workflows/policy.yml` in your repository:

```yaml
name: policy-gate
on: [pull_request]

jobs:
  check-policy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: read
    steps:
      - uses: actions/checkout@v4
      - uses: failuresmith/github-policy-gate@v1
```

## 2. Add the Policy Configuration

Create `.github/policy-gate.yml` to define your rules:

```yaml
policies:
  - id: critical-path-tests
    severity: error
    when:
      changed: ['src/core/**']
    require:
      changed: ['tests/**']
    message: 'Changes to the core engine must include updated tests.'

  - id: documentation-check
    severity: warn
    require:
      changed: ['README.md', 'docs/**']
    message: 'Consider updating documentation for this change.'
```

## 3. Open a Pull Request

Once you push these files, the action will:

1. Gather PR facts (changed files, labels, title, etc.).
2. Evaluate each policy against those facts.
3. Provide a summary in the action logs.
4. Add annotations to the PR for any violations.
5. Fail the build if any `error` level policies are violated.

## Missing Config?

Don't worry—if you add the action but forget the config file, `github-policy-gate` will generate a temporary advisory config. It won't block your PRs; it will just show you what an example configuration looks like in the logs.
