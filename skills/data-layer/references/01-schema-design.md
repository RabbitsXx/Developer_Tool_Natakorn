# 01 — Schema Design

## Purpose

Decide the shape of the data — types, keys, and constraints — so the database itself can reject invalid states.

## Rules

1. Follow the existing schema's naming and key conventions before introducing a new style.
2. Choose types precisely: exact numeric types for money, `timestamptz` stored in UTC for instants, bounded text for identifiers you validate, and generous or unbounded text for human content.
3. Make nullability a decision, not a default. If a value is conceptually always present, `NOT NULL` belongs in the database.
4. Enforce uniqueness, referential integrity, and range rules as database constraints (`UNIQUE`, `FOREIGN KEY`, `CHECK`). Application checks are a usability layer, not the guarantee.
5. Set the intended `ON DELETE`/`ON UPDATE` behavior explicitly on every foreign key, and know whether a delete cascades, restricts, or orphans.
6. Prefer a lookup table over a database enum when the set of values may grow, needs labels, or is referenced by other tables. Enums are fine for small, stable, code-owned sets.
7. Add server-set audit columns (`created_at`, `updated_at`, and `created_by`/`updated_by` when relevant) rather than trusting client timestamps.
8. Store derived or aggregated values only when measured need justifies it, and state the rule that keeps them accurate.
9. Decide delete semantics deliberately: soft delete preserves history but complicates every query and unique constraint; hard delete is simpler but irreversible.
10. Preserve existing behavior: adding a column or table is safe, while changing a type, tightening a constraint, or removing a column is a migration with a rollout plan.

## Anti-patterns

Avoid:

- storing money or quantities as floating point;
- relying on application code alone to keep two tables consistent;
- local-time timestamps or client-assigned IDs as the source of truth;
- reusing a column for a second meaning;
- a JSON blob where a real column or relation is needed for filtering and integrity;
- renaming or retyping a live column in one step with no compatibility plan.

## Output

Record for the change:

- the table/column definition with types, nullability, defaults, and constraints;
- keys, relations, and delete behavior, with the invariant each one protects;
- what existing data or behavior could be affected, and how it stays valid.
