# 03 — Query Safety and Performance

## Purpose

Keep data access correct under concurrency and predictable as tables grow, without guessing at optimizations.

## Rules

1. Use parameterized queries or the access layer's binding. Never build SQL by concatenating user input, filters, or identifiers.
2. Use least-privilege credentials: the application role gets only the privileges it needs, and migration/admin credentials do not ship with the app.
3. Scope every query, including lookups by ID, to the correct owner or tenant.
4. Bound every read: explicit `LIMIT`, explicit column list, and keyset (cursor) pagination rather than large offsets once data grows.
5. Index the predicates and sort orders you actually use — foreign key columns, frequent filters, and join keys. Add partial or covering indexes only when a real query justifies them.
6. Avoid per-row queries: batch, join, or eager-load instead of querying inside a loop. Check whether the access layer is emitting N+1 queries.
7. Wrap multi-statement invariants in a transaction, use the isolation level the invariant requires, and retry on serialization/deadlock failures with bounded attempts.
8. Set statement/query timeouts and connection pool limits so one slow path cannot exhaust the pool.
9. Measure before and after: read the query plan (`EXPLAIN`), note the row estimate and scan type, and confirm the index is actually used.
10. Watch for existing hazards when touching a query: growing-table full scans, unbounded aggregates, functions on indexed columns, and `SELECT *` that widens payloads silently.
11. Keep transactions short. Never hold a transaction open across a network call, a user interaction, or a long computation.

## Anti-patterns

Avoid:

- string-interpolated SQL, or dynamic `ORDER BY`/table names taken from the request;
- trusting that "it was fast on 200 rows" generalizes;
- adding an index without checking whether an existing one already covers the query;
- retry loops around non-idempotent writes;
- long-lived transactions that hold locks while waiting on external services;
- an ORM query that hides a full table scan behind a convenient method call.

## Output

Record for the change:

- the queries that changed, with the parameters and bounds they enforce;
- the plan or measurement that justified any index or rewrite, including before/after figures;
- transaction scope, isolation level, and retry behavior for writes;
- anything still unbounded, and why it is acceptable for now.
