# 03 — Containers and runtime

## Purpose

Make runtime images small, deterministic, non-privileged, and diagnosable.

## Rules

1. Use a pinned base strategy, multi-stage builds when useful, and a minimal runtime surface.
2. Run as a non-root user unless a documented requirement proves otherwise.
3. Define health checks, resource limits, graceful shutdown, and required filesystem/network behavior.
4. Do not bake secrets or development tooling into production images.

## Anti-patterns

Avoid:

- `latest` as the only deploy identity;
- running the application as root by habit;
- shipping source maps, credentials, or package caches without a reason.

## Output

Record image digest/tag, runtime user, health behavior, limits, and scan/verification results.
