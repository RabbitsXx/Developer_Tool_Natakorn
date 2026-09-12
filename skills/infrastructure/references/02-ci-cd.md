# 02 — CI/CD

## Purpose

Keep automated delivery reproducible, reviewable, and unable to deploy more than its authority permits.

## Rules

1. Pin action/tool versions where the project convention supports it and build from the lockfile.
2. Separate verification, artifact creation, promotion, and deployment permissions.
3. Make retries idempotent and fail closed on missing required checks or secrets.
4. Never put long-lived credentials in repository files or untrusted build logs.

## Anti-patterns

Avoid:

- a pipeline that deploys from any branch by default;
- skipping tests because a previous stage was slow;
- assuming CI success proves the service is healthy.

## Output

Record trigger, checks, artifact identity, permissions, environment gates, and observed run result.
