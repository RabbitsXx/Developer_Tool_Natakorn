# 05 — Data Verification

## Purpose

Prove the data change with observed evidence: applied migrations, executed plans, and constraints that actually rejected bad data.

## Required loop for any data change

1. Confirm the target environment by name and check that it is local or explicitly authorized for this change.
2. Apply the migration with the project's documented command and capture the real output.
3. Exercise the rollback path, or state clearly that it was reviewed and not executed, with the reason.
4. Verify the constraint behavior that changed: attempt a duplicate for a unique rule, an orphan for a foreign key, a null for a `NOT NULL`, an out-of-range value for a check.
5. Verify isolation and access rules with two identities or two tenants, including the negative case that must be rejected.
6. For backfills, verify correctness on a sample and confirm the run is repeatable without duplicating or corrupting rows.
7. For query changes, capture the plan or timing before and after, on data that is large enough to be meaningful.
8. Run the application tests that touch the changed data path, then check that no other query silently broke — renamed column, changed type, or changed null semantics.
9. Confirm nothing sensitive leaked into logs, fixtures, or committed files.
10. Report exact commands and observed results. Never claim a migration or backfill succeeded because the application still builds.

## Anti-patterns

Avoid:

- verifying only against an empty local database;
- skipping the rollback check because "the migration is simple";
- treating a passing application test suite as proof of data safety;
- seeding production-derived data into a lower environment;
- running destructive verification against an unnamed database;
- reporting "migration applied" without recording what was observed.

## Output

Report:

- the environment name and how it was confirmed;
- each command run and its observed result, including constraint and isolation negatives;
- the rollback status: executed, or reviewed only;
- measured before/after figures for performance claims;
- remaining risks, such as data volumes or paths that were not exercised.
