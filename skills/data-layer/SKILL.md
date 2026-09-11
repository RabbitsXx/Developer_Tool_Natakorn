---
name: data-layer
description: Design and change the data layer safely: schema and constraint design, migration safety and rollback, parameterized query and index work, multi-tenant scoping, row-level security, least-privilege credentials, backfills, and evidence-based data verification. Use when a task adds or changes a table, column, relation, index, constraint, migration, backfill, query, transaction, or data-access rule, or when diagnosing a slow or unsafe query. Do not use for pure UI work or for API contract changes that do not touch stored data.
compatibility: Instruction-only; no packages installed. Verification runs against a local or explicitly authorized test database using the project's existing client, ORM, or migration tool. Never requires production credentials.
metadata:
  version: "1"
  source: ultimate-vibecoder-ecosystem
  spec: agentskills.io/specification
---

# Data Layer

The database is the last line of defense for correctness. Application checks can be bypassed, raced, or forgotten; constraints, transactions, and access rules cannot.

## Invariants that hold in every task

1. Preserve the project's selected database provider and access layer. Never migrate providers, ORMs, or migration tools to match a preference.
2. Enforce invariants in the database, not only in application code.
3. Every migration is reviewed, reversible, and applied deliberately to a named environment.
4. Every query is parameterized, scoped, and bounded.
5. Schema files are not the whole database contract: provider behavior such as row-level security, grants, triggers, functions, extensions, and storage rules stays represented in SQL.
6. No destructive database operation without an explicit, named environment and authorization.

## Load only what the task needs

This skill is deliberately split. Read this file, then open only the reference files the task maps to.

| Task | Read in order |
|---|---|
| New table, column, relation, or constraint | [01](references/01-schema-design.md) → [03](references/03-query-safety-and-performance.md) → [05](references/05-data-verification.md) |
| Writing, reviewing, or repairing a migration | [02](references/02-migrations-safety.md) → [05](references/05-data-verification.md) |
| Slow query, missing index, N+1, or connection pressure | [03](references/03-query-safety-and-performance.md) → [05](references/05-data-verification.md) |
| Multi-tenant scoping, RLS, roles, or sensitive data | [04](references/04-multi-tenant-and-access.md) → [05](references/05-data-verification.md) |
| Backfill or data repair | [02](references/02-migrations-safety.md) → [03](references/03-query-safety-and-performance.md) → [05](references/05-data-verification.md) |

- 01 decides the model and the constraints before any migration is written.
- 02 makes schema change safe to apply, and safe to undo.
- 03 keeps queries parameterized, scoped, indexed, and bounded.
- 04 keeps tenant data and credentials separated.
- 05 replaces "the app tests pass" with applied migrations, observed plans, and checked constraints.

## Completion rule

Do not call a data change complete because the application builds or its unit tests pass. Apply the migration to a local or explicitly authorized database, confirm its rollback path, exercise the constraint and isolation behavior that changed (including a negative case), and report the exact commands with observed results. If a migration was only reviewed and never applied, say so explicitly.
