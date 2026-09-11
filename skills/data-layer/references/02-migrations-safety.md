# 02 — Migrations Safety

## Purpose

Make every schema change reviewable, applyable without avoidable downtime, and reversible if it goes wrong.

## Rules

1. Keep deployable migration history under version control. Never let an applied migration be edited afterward — add a new one.
2. One logical change per migration, with a name that states the intent.
3. Review generated migrations line by line before applying them. Generated SQL is a draft, not an authority.
4. Prefer additive-first rollout for breaking changes: add the new column/table, backfill, then shift reads and writes, and only then remove the old shape in a later migration.
5. Add nullable columns first, backfill, then enforce `NOT NULL` — in separate steps, so the change stays safe while old code is still running.
6. Know what locks. On large tables, an added constraint, rewritten column, or default can block writes; create indexes concurrently where the engine supports it and run them outside a transaction when required.
7. Make backfills batched, resumable, and idempotent, so an interrupted run can be repeated without duplicating or corrupting data.
8. Write down the rollback path for every migration, and verify that it actually works. If a change cannot be rolled back, say so before applying it.
9. Never run a destructive migration — drop, truncate, type rewrite, mass update — against a linked remote database unless the user explicitly names the environment and authorizes it.
10. Take a backup or snapshot point before anything destructive, and confirm the target environment identity before running.
11. Keep schema-tool state and applied-migration state consistent: if drift is possible, detect it instead of silently rewriting history.

## Anti-patterns

Avoid:

- editing a migration that already ran in a shared environment;
- one giant migration mixing schema, backfill, and cleanup;
- applying a destructive change because tests passed locally;
- assuming a small local table means a fast production migration;
- dropping a column in the same release that stops writing it;
- running migrations against an unnamed or uncertain environment.

## Output

Record for the change:

- the migration steps in order, each with its purpose;
- the lock/blocking risk and how it is avoided or accepted;
- the rollback procedure, and whether it is fully reversible;
- exactly which environment was targeted, and who authorized it.
