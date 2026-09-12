# 02 — Offline and sync

## Purpose

Make network loss and eventual consistency safe and visible to users.

## Rules

1. Classify reads, writes, retries, conflicts, and queued work explicitly.
2. Make writes idempotent where they can be replayed and show sync status without claiming success prematurely.
3. Define conflict resolution and stale-data behavior before adding optimistic UI.
4. Test airplane mode, timeout, resume, duplicate retry, and partial sync.

## Anti-patterns

Avoid:

- silently dropping writes;
- treating local optimistic state as server confirmation;
- retrying non-idempotent mutations without a key or deduplication.

## Output

Record state transitions, retry policy, conflict rule, and offline evidence.
