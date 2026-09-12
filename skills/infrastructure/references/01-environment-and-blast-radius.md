# 01 — Environment and blast radius

## Purpose

Make the target, ownership, dependencies, and failure impact explicit before infrastructure changes.

## Rules

1. Name the environment, account/project, region, service, and expected change set.
2. Separate plan/preview from apply; review generated changes before authorization.
3. Confirm backups, maintenance windows, dependencies, and rollback before touching shared or production resources.

## Anti-patterns

Avoid:

- applying from an ambiguous directory or account;
- treating a local `.env` or copied state file as authoritative;
- hiding a large blast radius behind a small ticket.

## Output

Record target identity, blast radius, preconditions, approvals, and rollback owner.
