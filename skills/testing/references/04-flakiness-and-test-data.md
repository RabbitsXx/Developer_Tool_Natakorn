# 04 — Flakiness and Test Data

## Purpose

Keep the suite trustworthy: a test that fails intermittently trains everyone to ignore failures.

## Rules

1. Treat a flaky test as a bug with an owner. Root-cause it; do not add retries to a test whose failure is unexplained.
2. If a retry policy exists, keep it narrow, log every retry, and keep a tracked issue for the underlying cause.
3. Remove the usual causes: timing assumptions, clock and timezone dependence, ordering between tests, shared mutable fixtures, unawaited async work, and port or resource collisions.
4. Make time deterministic: inject or freeze the clock, avoid "today" assumptions, and keep timezone and locale fixed in the test environment.
5. Generate unique data per run (a per-run prefix, a fresh tenant, a random-but-seeded value) so a leftover row cannot change the outcome.
6. Make cleanup reliable and idempotent — including cleanup after a test fails halfway through.
7. Test data must never be production data, customer records, or anything containing personal data. Build fixtures that are obviously fake.
8. Keep secrets out of test code and fixtures; read them from ignored environment files, and use disposable test credentials.
9. Watch suite-level health: a suite that keeps getting slower or noisier needs pruning, not another layer of forgiveness.
10. When a test must be skipped or quarantined, record why, who owns it, and when it will be revisited — a permanently disabled test is a silent hole.

## Anti-patterns

Avoid:

- "it passes locally" as a resolution;
- global retry settings that mask real failures across the whole suite;
- tests that depend on the order the runner happens to use;
- copying a slice of production data to make a test realistic;
- committing tokens, seeded passwords, or real emails into fixtures;
- deleting or skipping a failing test to make the suite green without recording it.

## Output

Record for the change:

- the flakiness cause found, or the investigation result if it is still open;
- what now makes the test deterministic (clock, data, isolation, waiting);
- how test data is generated and cleaned up;
- any skipped or quarantined test, with owner and revisit point.
