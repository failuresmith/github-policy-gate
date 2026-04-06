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

1. Run `make check`.
2. Tag a version like `v1.0.0`.
3. Let the release workflow build and publish the release.
