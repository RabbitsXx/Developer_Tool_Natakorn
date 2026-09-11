---
name: api
description: Design, implement, and verify HTTP APIs: resource and route shape, request validation, error contract and status codes, authentication and authorization boundaries, idempotency, concurrency safety, pagination, rate limits, webhooks, and repeatable contract verification with real requests. Use when a task adds or changes an endpoint, route handler, request or response schema, status code, error shape, webhook, API client, or API test. Do not use for pure UI work, or for database or infrastructure changes that have no HTTP surface.
compatibility: Instruction-only; no packages installed. Contract verification runs the project's own server plus its existing HTTP client or Bruno when the project already selected it. Never requires live production credentials.
metadata:
  version: "1"
  source: ultimate-vibecoder-ecosystem
  spec: agentskills.io/specification
---

# API

An API is a contract. The handler is an implementation detail; the status code, error shape, and authorization behavior are the product.

## Invariants that hold in every task

1. Never return `200` with an error payload. Status codes carry the outcome.
2. Validate and parse input at the boundary, before domain logic runs.
3. Derive identity, role, and tenant from verified server state — never from client-supplied fields.
4. Select response fields explicitly. Never spread a database row into a response.
5. Every failure path has a defined contract, not an incidental stack trace.
6. A change is not verified until real requests exercise it, including a negative path.

## Load only what the task needs

This skill is deliberately split. Read this file, then open only the reference files the task maps to.

| Task | Read in order |
|---|---|
| New endpoint, resource, or API surface | [01](references/01-contract-design.md) → [02](references/02-boundaries-and-validation.md) → [03](references/03-implementation-and-data-safety.md) → [05](references/05-contract-verification.md) |
| Change to an existing request/response shape | [01](references/01-contract-design.md) → [03](references/03-implementation-and-data-safety.md) → [05](references/05-contract-verification.md) |
| Auth, tenant scoping, or input-validation bug | [02](references/02-boundaries-and-validation.md) → [05](references/05-contract-verification.md) |
| Concurrency, retries, partial writes, or data-safety bug | [03](references/03-implementation-and-data-safety.md) → [05](references/05-contract-verification.md) |
| Rate limits, caching, webhooks, or long-running work | [04](references/04-reliability-and-abuse.md) → [05](references/05-contract-verification.md) |
| Adding or repairing API tests only | [05](references/05-contract-verification.md) |

- 01 fixes the contract before implementation starts.
- 02 makes the boundary the one place that trusts nothing.
- 03 keeps handlers correct under retries, concurrency, and partial failure.
- 04 keeps the API alive and unabusable under real traffic.
- 05 replaces "the tests pass" with observed requests and responses.

## Completion rule

Unit tests alone do not verify an API change. Exercise the changed endpoints with real requests against a running server, and include at least one failure path and one authorization-negative case (an identity that must be rejected). Report the exact method and path with the expected and observed status codes, and name any case left unverified and why.
