# 04 — Multi-Tenant and Access Rules

## Purpose

Keep tenant data separated and database access least-privileged, so a single missed application check does not become a data breach.

## Rules

1. Scope every read and write by tenant/owner, including by-ID lookups, counts, updates, deletes, and aggregate endpoints.
2. Treat provider-level row rules as defense in depth, not as a replacement for server-side authorization. Both layers should be able to reject the same bad access.
3. Keep provider behavior in the provider layer: row-level security policies, grants, triggers, functions, extensions, and storage rules belong in reviewed SQL migrations, not only in an ORM schema file.
4. Use separate roles for the application, migrations, and analytics/read-only access. Never let client-reachable code hold a service-role or superuser credential.
5. Never bypass access rules to make a feature convenient — for example, disabling row security for a query, or copying production data into a lower environment.
6. Treat personal and sensitive columns as a design decision: minimize collection, decide the retention period, and provide a deletion path.
7. Record sensitive mutations (who changed what, when) when the domain requires an audit trail, without logging the sensitive values themselves.
8. Keep connection strings, keys, and dumps out of the repository, out of logs, and out of documentation. Reference variable names only.
9. Verify isolation with two identities, including the negative case: tenant A must not read, update, or infer the existence of tenant B's data.
10. When a feature genuinely needs cross-tenant access, make it an explicit, reviewed path with its own authorization — not an exception buried in a query.

## Anti-patterns

Avoid:

- filtering by tenant only in the UI or only on list endpoints;
- trusting a tenant ID, account ID, or role supplied by the client;
- one shared admin credential for every service;
- disabling RLS, or granting broad permissions, to unblock a feature;
- logging row contents that contain personal data;
- assuming row rules exist because an ORM model declares a scope.

## Output

Record for the change:

- the tenant/owner scoping applied to each touched query;
- the roles involved and the privileges each one holds;
- any row-level rule that must accompany the change, and the migration that carries it;
- the isolation cases verified, including which identity was rejected.
