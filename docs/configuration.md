# Configuration Reference

The policy engine uses a YAML configuration file to define rules. By default, the action looks for `.github/policy-gate.yml`.

## Root level

| Key        | Type       | Description                   |
| :--------- | :--------- | :---------------------------- |
| `policies` | `Policy[]` | List of policies to evaluate. |

## Policy Shape

Each policy defines when it applies and what it requires.

```yaml
policies:
  - id: string # Required. Unique identifier for the policy.
    description: string # Optional. A human-readable description.
    severity: error|warn # Required. 'error' fails the build; 'warn' only annotates (unless fail-on-warn is true).
    when: predicate # Optional. Conditions that must be met for the policy to apply.
    require: predicate # Required. The rule that must be satisfied.
    message: string # Required. The message displayed when the policy is violated.
```

## Predicates

Predicates are the building blocks of policies. They evaluate to true or false based on pull request and repository facts.

### `changed`

Checks if any of the specified file patterns (globs) have changed in the pull request.

```yaml
changed:
  - 'src/**/*.ts'
  - 'package.json'
```

### `exists`

Checks if all of the specified file patterns exist in the repository at the current PR state.

```yaml
exists:
  - '.github/policy-gate.yml'
  - 'CODEOWNERS'
```

### `body`

Checks if the pull request **body** matches any of the specified regex patterns.

```yaml
body:
  - 'fixes #\d+'
  - 'runbook'
```

### `title`

Checks if the pull request **title** matches any of the specified regex patterns.

```yaml
title:
  - '^feat:'
  - '^fix:'
```

### `has_label`

Checks if the pull request carries any of the specified labels.

```yaml
has_label:
  - 'security-review'
  - 'deploy-safe'
```

### `approval_count_at_least`

Checks if the pull request has at least the specified number of approvals.

```yaml
approval_count_at_least: 2
```

### `file_contains`

Checks if specific files contain specific text patterns. This is a targeted check that only reads the requested files.

```yaml
file_contains:
  globs:
    - 'docs/runbooks/**/*.md'
  patterns:
    - 'rollback'
    - 'recovery'
```

## Combinators

Combinators allow you to build complex logic by combining predicates.

### `all`

Passes only if **every** child predicate passes.

```yaml
require:
  all:
    - has_label: ['ready']
    - approval_count_at_least: 1
```

### `any`

Passes if **at least one** child predicate passes.

```yaml
require:
  any:
    - approval_count_at_least: 2
    - has_label: ['fast-track']
```

### `not`

Inverts the result of the child predicate.

```yaml
when:
  not:
    has_label: ['experimental']
```

## Validation Rules

The configuration is strictly validated before execution:

- Unknown top-level or policy keys are rejected.
- Invalid severities are rejected.
- Empty IDs, messages, and arrays are rejected.
- Invalid predicate shapes are rejected.
- Negative approval thresholds are rejected.
