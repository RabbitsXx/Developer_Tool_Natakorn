# 05 — Security verification

## Purpose

Turn security intent into repeatable evidence before handoff or release.

## Rules

1. Run focused negative tests for authentication, authorization, validation, and sensitive error paths.
2. Run the project's dependency/secret scanner when configured and review findings rather than hiding them.
3. Verify logs and telemetry do not contain credentials, tokens, or unnecessary personal data.
4. Record what was not tested and why; security coverage is never implied by a green build.

## Anti-patterns

Avoid:

- treating a static scan as proof that authorization works;
- testing only the happy path;
- reporting “secure” without scope, date, tool, and observed result.

## Output

Report commands, negative cases, findings, accepted risks, and remaining verification gaps.
