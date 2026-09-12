# Agent memory

This directory contains append-only, non-secret context that helps a later agent resume work without rereading the whole repository.

- `decisions.jsonl` — durable decisions and their evidence.
- `lessons.jsonl` — verified lessons from failures and fixes.
- `handoff.md` — the current human-readable next-step summary.

Never store credentials, raw environment values, customer data, or private keys here.
