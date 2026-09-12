# 05 — Operational verification

## Purpose

Prove that infrastructure changes work under the conditions users and operators will encounter.

## Rules

1. Verify deploy identity, health checks, logs, metrics, alerts, and rollback from the target environment.
2. Test failure modes relevant to the change: unavailable dependency, bad config, capacity, timeout, or restart.
3. Keep a concise incident or change record with owner, watch window, and follow-ups.

## Anti-patterns

Avoid:

- checking only that an API returned 200 once;
- suppressing alerts to make a rollout look green;
- leaving an unowned rollback or manual step.

## Output

Report commands, target, observed signals, rollback result or reason not run, and remaining risk.
