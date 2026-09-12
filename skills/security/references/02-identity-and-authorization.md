# 02 — Identity and authorization

## Purpose

Keep identity and permission decisions server-side and resource-specific.

## Rules

1. Authenticate before authorization, then authorize the exact action on the exact resource.
2. Derive user, tenant, role, and ownership from verified server state, never request fields.
3. Test both allowed and denied cases, including cross-tenant and object-ID substitution cases.

## Anti-patterns

Avoid:

- hiding a button and treating that as authorization;
- checking only that a user is logged in;
- accepting `role`, `tenantId`, `ownerId`, or price from the client.

## Output

Record the protected resource/action matrix and the negative cases exercised.
