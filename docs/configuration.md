# Configuration Reference

## File location

Default path: `.github/policy-gate.yml`

## Shape

```yaml
policies:
  - id: string
    description: string
    severity: error | warn
    when: predicate
    require: predicate
    message: string
```

`when` is optional. If omitted, the policy always applies.

## Predicates

### changed

```yaml
changed:
  - 'src/**'
```

### exists

```yaml
exists:
  - 'README.md'
```

### pr_text

```yaml
pr_text:
  - 'rollback'
```

### title

```yaml
title:
  - '^release:'
```

### has_label

```yaml
has_label:
  - 'deploy-change'
```

### approval_count_at_least

```yaml
approval_count_at_least: 2
```

### file_contains

```yaml
file_contains:
  globs:
    - 'docs/runbooks/**/*.md'
  patterns:
    - 'rollback'
```

## Combinators

### all

Every child must pass.

### any

At least one child must pass.

### not

Inverts a child predicate.

## Validation rules

- Unknown top-level and policy keys are rejected.
- Invalid severities are rejected.
- Empty IDs, messages, and arrays are rejected.
- Invalid predicate shapes are rejected.
- Negative approval thresholds are rejected.
