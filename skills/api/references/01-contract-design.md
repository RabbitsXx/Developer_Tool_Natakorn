# 01 — HTTP Contract Design

## Purpose

Fix the request/response contract before writing handler code, so the interface is decided by the product rather than by whatever the first implementation happened to return.

## Rules

1. Use plural resource nouns in paths (`/orders`, `/orders/{id}`); verbs belong in the method, not the path.
2. Respect method semantics: `GET` is safe and idempotent; `PUT` replaces idempotently; `PATCH` is partial; `POST` creates or triggers an action; `DELETE` is idempotent.
3. Choose status codes deliberately:
   - `201` with `Location` when a resource is created; `204` when a body is genuinely absent.
   - `202` only when work is accepted asynchronously and the client can observe it.
   - `400` for malformed input, `422` for well-formed but semantically invalid input, `415` for unsupported content type.
   - `401` when unauthenticated, `403` when authenticated but not permitted, `404` when the resource is absent or not visible to this identity.
   - `409` for state conflicts, `412` for failed preconditions, `429` for rate limits, `503` when a dependency is unavailable.
4. Define one error envelope for the whole API and use it everywhere: a stable machine code, a human message, and optional field-level detail. Never invent a second error shape per route.
5. Keep field naming consistent across the API (one of camelCase or snake_case), and emit timestamps as ISO 8601 UTC.
6. Treat IDs as opaque strings. Clients must not parse meaning out of them.
7. Design pagination before the dataset is large: a cursor is safer than an offset for data that can change between requests. Return an explicit envelope rather than a bare array when more pages may exist.
8. Whitelist which fields can be filtered, sorted, and included. Never accept arbitrary sort or field expressions from the client.
9. Choose one versioning approach (URL segment or header) and never silently change the meaning or type of a published field. Additive fields are safe; removal is a version change.
10. When a field or route is deprecated, say so explicitly and give the client a migration path.

## Anti-patterns

Avoid:

- `200` responses carrying `{ "success": false }`;
- distinct error shapes for validation, auth, and server errors;
- exposing internal identifiers, table names, enum ordinals, or stack traces;
- `POST /getOrders`-style action routes where a resource route would do;
- unbounded or client-controlled `limit`, `offset`, `page`, or sort fields;
- changing a field's type or nullability while pretending it is the same contract.

## Output

For the change under discussion, record:

- the resource/route table: method, path, purpose, required permission, success status, error statuses;
- one concrete request and response example per route changed;
- the shared error envelope, with a worked example;
- pagination and filtering rules the implementation must follow.
