# Policy Examples

## Required tests for changed files

```yaml
policies:
  - id: queue-change-requires-tests
    severity: error
    when:
      changed:
        - 'runtime/queue/**'
        - 'runtime/store/**'
    require:
      any:
        - changed:
            - 'tests/**'
        - changed:
            - 'failure_modes/**'
    message: 'Queue/store changes require tests or failure-mode updates.'
```

## Require changelog for API changes

```yaml
policies:
  - id: public-api-change-needs-changelog
    severity: warn
    when:
      changed:
        - 'api/public/**'
    require:
      any:
        - changed:
            - 'CHANGELOG.md'
        - has_label:
            - 'release-note-exempt'
    message: 'Public API changes should include a changelog update or exemption label.'
```

## Require deploy label for workflow changes

```yaml
policies:
  - id: workflow-change-needs-label
    severity: warn
    when:
      changed:
        - '.github/workflows/**'
    require:
      has_label:
        - 'deploy-change'
    message: 'Workflow changes should carry a deploy-change label.'
```

## Require docs for infra changes

```yaml
policies:
  - id: infra-change-needs-docs
    severity: error
    when:
      changed:
        - 'infra/**'
    require:
      any:
        - changed:
            - 'docs/**'
        - file_contains:
            globs:
              - 'docs/**/*.md'
            patterns:
              - 'rollback'
              - 'runbook'
    message: 'Infra changes require docs or runbook evidence.'
```
