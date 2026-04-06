# Contributing

## Local setup

```bash
make install
```

## Standard checks

```bash
make lint
make test
make coverage
make validate
make build
```

`make check` runs lint, formatting checks, typecheck, tests, coverage, and bundle generation.

## Release flow

1. Merge the intended changes to `main`.
2. Update `package.json` to the release version before merge.
3. Run the `release` workflow manually from `main`.
4. The workflow reads the version from `package.json`, validates source, creates a release commit on `release`, tags `vX.Y.Z`, and moves `vX`.
