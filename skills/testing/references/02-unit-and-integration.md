# 02 — Unit and Integration

## Purpose

Put each test at the level where it can catch the real failure, without mocking away the thing that was actually broken.

## Rules

1. Unit-test pure logic: parsing, validation rules, calculations, state transitions, formatting. These should be fast, deterministic, and free of I/O.
2. Integration-test boundaries: an HTTP handler, a database query, a queue consumer, a file or external call. These are where the bugs that unit tests cannot see actually live.
3. Mock at the boundary you do not control — a network service, a clock, a payment provider — not at internal functions you own. Mocking your own internals makes the test agree with the implementation by construction.
4. When a test double stands in for a real dependency, keep the double honest: update it when the real contract changes, and cover the real path at least once at integration level.
5. Prefer a real local dependency over a hand-written fake when it is cheap (a temporary database, an in-process server). Drift between fake and reality is a silent source of false confidence.
6. Build each test's own data. Do not depend on rows another test created, on execution order, or on a shared mutable fixture.
7. Inject what is nondeterministic — clock, random seed, ID generator, locale — instead of asserting around it.
8. Keep assertions specific: one reason to fail, a message that says what was expected and what happened.
9. Clean up what the test created, or run against disposable state, so repeated runs are safe.
10. When the project has fixtures or factories, extend them; do not introduce a parallel dataset.

## Anti-patterns

Avoid:

- mocking the module under test's own collaborators so heavily that nothing real is exercised;
- assertions on internal call counts that break on a harmless refactor;
- tests that pass only when run in one order, or only on the first run;
- shared global state between tests;
- treating a green unit suite as proof that the integration works;
- asserting on wall-clock timings rather than behavior.

## Output

Record for the change:

- each new or changed test, with its level and the behavior it pins;
- the boundary tested for real, and the dependencies that were doubled with the reason;
- how the test data is created and cleaned up;
- any path that could only be tested manually, and how it was verified instead.
