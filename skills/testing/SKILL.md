---
name: testing
description: Decide what to test, at which level, and how to keep a suite trustworthy: risk-based test selection, unit and integration boundaries, critical browser journeys, deterministic fixtures and test data, flakiness root-causing, regression tests for every fixed bug, and honest reporting of checks that ran. Use when a task adds or changes tests, chooses what to verify before handoff, fixes a bug that should never return, deals with flaky or slow tests, or decides what CI gates. Do not use as a substitute for the pack that owns the code being changed.
compatibility: Instruction-only; no packages installed. Uses the project's existing test runner, and Playwright or @axe-core/playwright only when the project already selected them. Never requires production data or credentials.
metadata:
  version: "1"
  source: ultimate-vibecoder-ecosystem
  spec: agentskills.io/specification
---

# Testing

A test suite is an asset only while it is trusted. A suite that is flaky, slow, or full of tests that assert implementation details gets ignored — and then it protects nothing.

## Invariants that hold in every task

1. Test behavior and contracts, not implementation details.
2. Every test must be able to fail for the right reason: if the bug it describes is reintroduced, it fails.
3. Prefer a small suite that covers real risk over broad coverage of trivial paths.
4. Tests never touch production data, production credentials, or live customer records.
5. A check is only evidence if it actually ran. Record skipped checks and the reason.
6. Fix flakiness at the cause; do not retry your way past it.

## Load only what the task needs

This skill is deliberately split. Read this file, then open only the reference files the task maps to.

| Task | Read in order |
|---|---|
| New feature or behavior change | [01](references/01-test-strategy.md) → [02](references/02-unit-and-integration.md) → [05](references/05-regression-and-evidence.md) |
| Bug fix | [05](references/05-regression-and-evidence.md) → [02](references/02-unit-and-integration.md) |
| New, failing, or skipped browser journey | [03](references/03-e2e-and-journeys.md) → [04](references/04-flakiness-and-test-data.md) → [05](references/05-regression-and-evidence.md) |
| Flaky, slow, or order-dependent suite | [04](references/04-flakiness-and-test-data.md) → [05](references/05-regression-and-evidence.md) |
| Fixtures, factories, or test secrets | [04](references/04-flakiness-and-test-data.md) → [02](references/02-unit-and-integration.md) |
| Deciding what runs before handoff or in CI | [01](references/01-test-strategy.md) → [03](references/03-e2e-and-journeys.md) → [05](references/05-regression-and-evidence.md) |

- 01 chooses the level and the risk the test protects.
- 02 keeps unit and integration tests honest about boundaries.
- 03 keeps browser journeys few, real, and stable.
- 04 removes the sources of flakiness and unsafe test data.
- 05 turns a fixed bug into a permanent test and into reported evidence.

## Completion rule

Do not report a suite as passing unless the command ran and its output was read. State which level of test was added, which risk it covers, and which checks were skipped with the reason. For a UI or API change, remember that this pack does not replace the browser or contract verification owned by the `ui-ux` and `api` packs.
