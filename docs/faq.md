# FAQ

## Does this need a GitHub App?

No. It is a standard JavaScript GitHub Action.

## What happens if the config is missing?

The action generates a temporary advisory-only config under `RUNNER_TEMP`, logs the generated path, and keeps the job non-blocking.

## Does it read the whole repository?

Only when active policies require repository facts such as `exists` or `file_contains`. File contents are read only for targeted globs.

## Can warnings fail the job?

Yes. Set `fail-on-warn: true`.
