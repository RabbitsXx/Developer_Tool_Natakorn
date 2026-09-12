# 04 — Secrets and supply chain

## Purpose

Keep credentials out of code and make dependency/build changes reviewable.

## Rules

1. Use the project's secret store/environment mechanism and never print secret values.
2. Pin dependencies through the existing lockfile; review new packages, install scripts, permissions, and transitive risk.
3. Treat generated artifacts, logs, fixtures, screenshots, and crash reports as possible data exfiltration paths.
4. Rotate a credential if it was exposed; do not merely delete the line from Git.

## Anti-patterns

Avoid:

- putting secrets in `.env.example`, tests, commits, screenshots, or URLs;
- adding a package because a model suggested it without checking project conventions and maintenance risk.

## Output

Record secret handling, dependency changes, scans run, and any exposure/rotation action.
