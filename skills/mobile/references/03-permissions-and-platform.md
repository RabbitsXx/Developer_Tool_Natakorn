# 03 — Permissions and platform APIs

## Purpose

Use native capabilities transparently, minimally, and with graceful denial behavior.

## Rules

1. Request only the permission needed for the current user action and explain the value before asking.
2. Define denied, restricted, revoked, unavailable, and changed-settings behavior.
3. Keep platform API access behind an adapter and avoid leaking raw native details through the domain.

## Anti-patterns

Avoid:

- requesting every permission on first launch;
- assuming permission remains granted forever;
- blocking the whole app when an optional capability is denied.

## Output

Record permission rationale, platform differences, fallback UX, and denial test evidence.
