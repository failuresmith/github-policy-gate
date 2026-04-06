# github-policy-gate Agent Guide

This repository is a **publishable GitHub Action for policy as code in pull request CI**.

If a proposed change does not make the action more useful, more reliable, easier to adopt, or easier to publish, do not make it.

## Mission

Build and maintain the smallest genuinely useful MVP for:

`uses: failuresmith/github-policy-gate@v1`

The action evaluates a YAML policy file against pull request facts and repository facts, then warns or fails with clear messages.

## Primary Objective

Help teams add PR guardrails with the least possible infrastructure:

- no bot
- no web service
- no database
- no GitHub App
- no external dependency beyond GitHub and the checked-out repository

The product should feel easy to trust, easy to read, and easy to adopt in any repository.

## Reward Function

Optimize for these outcomes, in this order:

1. Correct policy decisions
2. Clear user-facing failure messages
3. Safe, deterministic behavior in CI
4. Low adoption friction
5. Small, maintainable code
6. Publishable action packaging

A good change increases one of those without materially hurting a higher-priority item.

## Non-Negotiable Product Constraints

- This is a TypeScript GitHub Action, not a bot.
- Keep the config DSL human-friendly YAML.
- The policy engine is based on:
  - facts
  - simple predicates
  - composable combinators
  - clear failure messages
- Missing config must never hard-fail the repository by surprise.
  - If `.github/policy-gate.yml` is missing, generate a temporary advisory-only config under `RUNNER_TEMP`.
  - Do not write fallback config into the repository.
- No AI features.
- No AST parsing.
- No language-specific semantic analysis.
- No hidden network calls beyond GitHub API usage needed for PR facts.

## Current MVP Scope

Supported facts:

- changed files
- added files
- removed files
- renamed files
- PR title
- PR body
- labels
- requested reviewers
- approvals count
- file existence in repo
- file content for targeted files only

Supported predicates:

- `changed(globs)`
- `exists(globs)`
- `pr_text(patterns)`
- `title(patterns)`
- `has_label(labels)`
- `approval_count_at_least(n)`
- `file_contains(globs, patterns)`

Supported combinators:

- `all`
- `any`
- `not`

If you want to add anything outside this list, require a strong reason tied to adoption or practical utility.

## Engineering Priorities

- TDD first for behavior changes
- strict TypeScript
- deterministic pure core logic
- imperative shell and GitHub API usage only at the edges
- defense in depth and input validation
- functions should stay small and single-purpose where practical
- readability over cleverness
- minimal abstractions

## Repository Map

- `src/action/`
  - GitHub Action entrypoint, inputs, reporting, orchestration
- `src/config/`
  - config loading, fallback config, validation, schema
- `src/facts/`
  - GitHub PR facts and repository file facts
- `src/predicates/`
  - simple predicate evaluation
- `src/engine/`
  - pure predicate and policy evaluation
- `src/utils/`
  - low-level helpers only
- `tests/unit/`
  - behavior-level unit tests
- `tests/integration/`
  - end-to-end action flow tests
- `tests/fixtures/`
  - self-test fixture configs
- `docs/`
  - onboarding, configuration, examples, architecture, FAQ
- `.github/workflows/`
  - CI, self-test, release

## Change Rules

### 1. Preserve the core product promise

Changes must keep the action:

- easy to adopt
- easy to reason about
- safe by default
- publishable as a normal GitHub Action

### 2. Test first for behavior changes

For any behavior change:

- add or modify tests first
- prefer unit tests for engine logic
- add integration tests for action orchestration or fallback behavior

### 3. Keep the engine pure

`src/engine/` and `src/predicates/` should remain deterministic and side-effect free.

Do not leak GitHub API calls, filesystem mutation, or environment access into the core evaluator.

### 4. Read only what is needed

Repository scans and file reads must remain targeted:

- avoid full file-content scans
- only read contents for matched `file_contains` globs
- short-circuit cheap checks before expensive ones when practical

### 5. Error messages are product surface

Treat policy messages, logs, and annotations as user-facing product behavior.

They must be:

- concise
- actionable
- specific enough to explain why a policy failed

### 6. Avoid speculative expansion

Do not add:

- extra predicate types
- outputs with no clear user value
- extra packaging complexity
- generalized frameworks

unless there is a concrete, high-signal need.

## Release Standard

A change is not done unless the repo still supports:

- `npm run check`
- `npm run validate`
- `npm run release-dry-run`

Coverage is part of the contract. Do not weaken it casually.

## Agent Checklist Before Shipping

- Does the change strengthen the mission?
- Is the MVP still the smallest useful version?
- Are tests updated first or alongside the change?
- Is config validation still strict and readable?
- Is missing-config fallback still advisory-only?
- Is the action still usable from another repository via `uses: failuresmith/github-policy-gate@v1`?
- Are docs or examples updated if the user-facing behavior changed?

## If You Are Unsure

Default to this sequence:

1. Read `README.md`
2. Read the relevant module under `src/`
3. Read the matching tests
4. Add or update tests
5. Make the smallest change that satisfies the tests
6. Run the standard verification commands

Do not broaden scope just because an abstraction seems attractive.
