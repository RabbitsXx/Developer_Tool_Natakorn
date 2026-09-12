# 04 — Cloud and least privilege

## Purpose

Change cloud resources with explicit scope, minimal permissions, and a recoverable path.

## Rules

1. Use the project's existing provider and infrastructure-as-code conventions.
2. Scope identities to the resources/actions required; separate read, deploy, migrate, and admin roles.
3. Review network exposure, public endpoints, encryption, retention, and audit logging for the changed resource.
4. Never execute destructive cloud operations without the named environment and explicit authorization.

## Anti-patterns

Avoid:

- broad admin credentials in local shells or CI;
- assuming private-by-default without checking the actual provider setting;
- changing production configuration as a side effect of local setup.

## Output

Record provider target, permissions, exposure, data handling, approval, and resulting state.
