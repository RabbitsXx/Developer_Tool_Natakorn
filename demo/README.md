# Demos — the kit with and without

Two self-contained, zero-dependency comparison sites. Every claim on them comes from the
recorded v0.9.0 → v1.0.0 trial in [`docs/AUDIT.md`](../docs/AUDIT.md); nothing is staged
or invented for effect. Open either `index.html` directly in a browser — no build, no server.

## `kit-comparison.html` — the kit against real engineering tasks

The trial's three tasks shown with/without the kit: contract-first API work, a schema
migration with a verified rollback, and a failing-first regression fix. Includes an
interactive simulation of the concurrency bug the packs found during the trial
(20 concurrent submissions, one Idempotency-Key → 20 duplicate jobs without the kit's
rules, 1 create + 19 honest replays with them).

## `company-landing/` — one landing-page brief, two delivery processes

A fictional company ("Ledgerly", an invoicing product), the same brief, built twice:

| File | What it is |
|---|---|
| `without.html` | How a bare agent typically ships: fake urgency countdown, unverifiable stats, a form that prints success for any input, fixed 1200px layout, div-buttons |
| `with.html` | The same brief under the kit's `ui-ux` pack rules: user-goal-first copy, scoped claims, honest "what this doesn't do" note, accessible form with a real error path |
| `index.html` | Hub: both pages embedded and fully interactive side by side, plus a live audit button that probes both pages — including submitting garbage into each form and reporting what actually happened |

The audit's key check is behavioral on purpose: it *runs* the pages instead of reading
their source, because static string matching lies when behavior lives in an initializer.
That rule — evidence from a run, not from a reading — is the kit's own.

## What these demos do and do not claim

- The "without" columns are the predictable default of an agent with no operating
  contract, not a strawman of any specific tool.
- Token figures on the comparison page are bytes/4 estimates, not measured tokenizer
  counts.
- The command gate is a gate + audit trail, not an OS sandbox; the demos inherit that
  honesty section verbatim.
