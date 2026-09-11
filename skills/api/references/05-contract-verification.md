# 05 — Contract Verification

## Purpose

Replace "the tests pass" with observed requests and responses, because an API contract is only proven by exercising it.

## Required loop for any endpoint change

1. Start the real application or route locally, with the project's documented command.
2. Send real requests to every changed endpoint.
3. Verify the success case: status code, headers that matter, and the exact response field set.
4. Verify each failure path that the contract defines: missing field, wrong type, out-of-range value, unauthenticated, forbidden, not found, conflict, rate limited.
5. Run an authorization-negative case with a second identity that must be rejected — not just a second request from the same identity.
6. Repeat a non-idempotent request to confirm the idempotency behavior is real.
7. Probe the boundaries: empty result, single item, last page, invalid cursor, maximum accepted size, oversized input.
8. Confirm nothing internal leaked: no stack traces, SQL text, internal identifiers, secrets, or unfiltered row fields.
9. Run the project's automated API tests, then keep a repeatable request collection in the repository (for example Bruno) so the same cases can be replayed by the next agent.
10. Keep environment values for the collection in the project's ignored environment files; never commit credentials or tokens.

## Anti-patterns

Avoid:

- verifying only the happy path;
- testing against mocks that always agree with the implementation;
- committing secrets in a request collection or example response;
- claiming verification from unit tests, type checks, or a successful build alone;
- asserting a status code without inspecting the error envelope that clients will actually parse;
- running destructive or production-mutating requests without explicit authorization.

## Output

Report:

- an evidence table per changed endpoint: case, request, expected status, observed status, notes;
- the authorization-negative case that was exercised and who was rejected;
- cases intentionally not verified, with the reason;
- remaining risks, such as dependencies that were stubbed or endpoints that need production data.
