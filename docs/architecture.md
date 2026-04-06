# Architecture

## Flow

1. Load and validate YAML config.
2. Gather pull request facts and only the repository facts needed by the config.
3. Evaluate simple predicates and combinators with pure functions.
4. Emit annotations, warnings, errors, and a short log summary.

## Modules

- `src/config`: parsing, validation, safe default config
- `src/facts`: PR files, approvals, local repository file reads
- `src/predicates`: small fact checks
- `src/engine`: pure policy evaluation
- `src/action`: GitHub Action orchestration

## Constraints

- No bot, server, database, or external service
- No AST parsing
- No language-specific semantic analysis
- Deterministic evaluation with explicit facts
