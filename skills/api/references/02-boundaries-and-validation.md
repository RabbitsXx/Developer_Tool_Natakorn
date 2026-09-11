# 02 — Boundaries and Validation

## Purpose

Make the request boundary the single place that trusts nothing, so domain logic can be written against already-validated, already-authorized inputs.

## Rules

1. Parse and validate before domain work. Transport concerns stay in the transport layer; the domain receives typed, checked values.
2. Validate type, required-ness, length, range, numeric precision, enum membership, and collection size for every accepted field.
3. Decide explicitly what happens to unknown fields — reject or ignore — and apply the same rule everywhere.
4. Cap request body size and reject unsupported content types (`415`) before parsing deeply.
5. Never trust client-supplied identity, role, tenant, owner, price, status, or computed totals. Derive them from verified session/token state and server-side data.
6. Authorize the specific resource, not just the session: check that this actor may act on this object. Missing ownership checks are the classic IDOR bug.
7. Distinguish `401` from `403` honestly, and avoid responses that reveal whether an unrelated resource exists.
8. Scope every query by tenant/owner when the data model is multi-tenant, including lookups by ID, counts, and list endpoints.
9. Use separate credentials for service-to-service calls; do not replay a user token for machine access, and do not treat CORS as authorization.
10. Treat any client-supplied URL, filename, path, or hostname as hostile: constrain outbound destinations (SSRF), normalize file paths (traversal), and never let a client pick the target of a privileged fetch.
11. Keep secrets, tokens, hashes, and personal data out of logs, error messages, and responses.

## Anti-patterns

Avoid:

- validating only on the client, or only in the UI layer;
- `role=admin` style parameters, hidden form fields, or headers the client can set to escalate;
- "logged in implies allowed" checks;
- returning the offending object or full SQL error to explain a failure;
- catching validation errors into a generic `500`;
- echoing the request back into the response when it may contain credentials.

## Output

Record for the change:

- the validation rules per accepted field, including limits and unknown-field policy;
- an authorization matrix: actor type/role → allowed actions → expected status;
- the negative cases that must be rejected, and the status code each must produce.
