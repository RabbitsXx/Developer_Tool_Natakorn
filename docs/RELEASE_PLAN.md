# Release plan and stop rules

This file exists for one reason: to give the kit a defined end so it gets used instead of polished forever.

## The problem this solves

Every gate in this kit validates the kit against itself (`validate-kit`, `verify-bootstrap-protocol`, `eval-kit`, `sync-skill-docs`). That proves internal consistency and proves nothing about whether the kit helps on real work. Until the kit is used on a real project, "improvements" are speculation, and each one adds tokens to every future session.

## Status: v1.0.0 criteria met (2026-09-12)

The v0.9.0 trial is complete: three real tasks on one new project, all four criteria passed, zero kit edits required. Evidence and failures are recorded in `docs/AUDIT.md` → "v0.9.0 → v1.0.0 trial result". The result below is kept for the record.

### Trial record (frozen at v0.9.0)

Everything present at the `v0.9.0` tag was frozen. No new skill pack, script, gate, or document was added during the trial.

## v1.0.0 — definition of done

> Use this kit on one real project, complete three real tasks end to end (bootstrap → change code → verify → commit), without editing the kit in between.

All four criteria must hold:

1. **Preserve, don't replace.** Bootstrap on the project does not force a stack, package-manager, or provider change (zero unwanted changes).
2. **Verified work.** The three tasks pass the project's own checks (lint, typecheck, tests, build), and no check is reported as passing unless it was run and its output read.
3. **Packs actually used.** At least three packs are loaded for real work and their completion rules are followed — for example a negative-case request for `api`, an applied-and-checked rollback for `data-layer`, a failing-first regression test for `testing`.
4. **Measured.** Record: tasks completed, tokens and time per task, and the number of kit edits the trial required. The target for kit edits is zero.

## Stop rules

- The trial ends after **three real tasks or two weeks**, whichever comes first. It does not continue until it "feels done".
- During the trial, the only kit changes allowed are ones traceable to **one specific observed failure**. Anything else is written down and deferred.
- Deferred items go to the `v1.0.1` backlog below and are not implemented mid-trial.
- After three tasks, if the kit produced no measurable improvement over asking an agent directly, **delete the parts that cannot be traced to a real failure** instead of adding more.

## Trial protocol

1. Start from a blank directory and let the kit classify it as `NEW_PROJECT`.
2. Derive the smallest stack from the actual requirement; do not install the reference stack wholesale.
3. Record a session in `.ai-kit/metrics/` at the start and end of each task.
4. After each task, note which pack was loaded, what evidence the task produced, and every moment the kit got in the way.
5. At the end, write the findings into `docs/AUDIT.md` and decide: tag `v1.0.0`, or cut scope.

## Deferred to v1.0.1 (do not implement before the trial)

- Trim instruction rules that cannot be traced back to a real failure.
- Remove content duplicated across `docs/BOOTSTRAP_PROTOCOL.md`, `docs/INSTALLATION.md`, `docs/ARCHITECTURE.md`, and `docs/QUALITY_AND_PRODUCTION.md`.
- Add a self-check that fails when the always-read instruction files exceed a byte budget.
- Report real token usage per session from `.ai-kit/metrics/` instead of byte estimates.
- Additional domain packs (CLI tooling, data/ML pipelines, desktop, compliance).
- Task-level evals that measure agent outcomes rather than kit contracts.
