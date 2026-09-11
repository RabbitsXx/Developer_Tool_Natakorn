# 01 — Preflight

## Purpose

Prove the release is ready before anything moves, while every problem found is still cheap to fix.

## Rules

1. Start from the exact commit intended for release; confirm the working tree is clean, the branch is correct, and the build is reproducible from that commit.
2. Run the full verification ladder the project defines — format, lint, typecheck, focused tests, full tests, production build — and record each result. A skipped check is recorded with its reason, never silently omitted.
3. Confirm database migration state: which migrations are pending, whether they follow the additive-first ordering from the `data-layer` pack, and that they have been applied to a staging or preview environment first.
4. Verify configuration for the target environment: every new environment variable has a value set outside Git, secrets are present in the platform's secret store, and no placeholder or development value is about to reach production.
5. Confirm the release notes or change list: what user-visible behavior changes, which features are behind flags, and what this release makes possible that was impossible before.
6. Check integration boundaries the release touches — third-party webhooks, scheduled jobs, provider limits — so external surprises are not discovered during the deploy.
7. Confirm the deployment target explicitly: environment name, project, and account. A deploy to the wrong environment is not recoverable by a quick rollback of intent.
8. Decide the go/no-go criteria in writing before deploying: the health signals that must look right, and who makes the call.

## Anti-patterns

Avoid:

- deploying from a dirty tree or an unverified commit because "it works on my machine";
- treating a green pipeline as the preflight instead of a part of it;
- shipping pending migrations that assume code not yet deployed, or the reverse;
- discovering a missing production environment variable during the deploy;
- starting without knowing which environment is being targeted.

## Output

Record before deploying:

- the commit, branch, and build artifact being released;
- each verification result, including skipped checks and why;
- pending migrations and their staging status;
- configuration and secrets confirmed for the named environment;
- the go/no-go criteria and the person holding the decision.
