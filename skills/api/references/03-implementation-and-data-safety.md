# 03 — Implementation and Data Safety

## Purpose

Write handlers that stay correct when clients retry, requests overlap, a downstream service stalls, or a write is interrupted halfway.

## Rules

1. Keep transport, domain, and data concerns separable: the handler parses and formats, the domain decides, the data layer persists.
2. Put a transaction boundary around any invariant that spans multiple writes. No half-applied state.
3. Enforce uniqueness with database constraints, not check-then-insert. Two concurrent requests can both pass a read check.
4. Support idempotency for non-idempotent operations that clients will retry (payments, sends, webhooks, imports): accept an idempotency key, persist the outcome, and return the original result on replay.
5. Set timeouts on every database and outbound HTTP call, and honor request cancellation. A handler must not hang on a stalled dependency.
6. Retry only operations that are safe to retry, with bounded attempts, backoff, and jitter. Never wrap a non-idempotent handler in a blind retry loop.
7. Avoid query-per-item loops; batch or join. Select only the columns the response needs.
8. Map rows to responses explicitly (DTO/serializer or explicit select). Never spread a row, which silently publishes new columns later.
9. Distinguish "absent" from "zero" and "empty" consistently, and never invent values for missing data.
10. Generate timestamps and identity server-side; treat client-supplied times as untrusted input.
11. Turn a concurrent write conflict into an explicit `409` with a retry hint instead of an opaque `500`.
12. Emit a request identifier through the handler so a failure can be traced to the exact request that caused it.

## Anti-patterns

Avoid:

- business rules living in a route handler interleaved with ORM calls;
- `SELECT *` feeding a response;
- trusting client timestamps, client-assigned IDs, or client-computed totals;
- silently swallowing a write failure and returning success;
- retrying the whole handler after a partial write without idempotency;
- logging the full request body when it can contain credentials or personal data.

## Output

Record for the change:

- the ordered steps of the handler, with the transaction boundary marked;
- what happens on retry, on concurrent duplicate submission, and on timeout;
- the response mapping, including which fields are explicitly published.
