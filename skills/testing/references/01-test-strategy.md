# 01 — Test Strategy

## Purpose

Spend testing effort where failure would actually hurt, instead of where it is easiest to write a test.

## Rules

1. Rank by risk first: data loss, money, authentication and authorization, destructive actions, and irreversible operations get tests before cosmetic paths do.
2. Choose the lowest level that can still catch the failure. Logic belongs in a fast unit test; a boundary belongs in an integration test; only a real user journey justifies a browser test.
3. Write one behavior per test, named for the behavior and the condition, so a failure message points at the cause without reading the code.
4. Assert on observable outcomes — returned values, stored state, responses, rendered content — not on private method calls or internal counters.
5. Cover the negative space deliberately: invalid input, unauthorized actor, empty result, duplicate submission, and the error path. The happy path alone is a demo, not a test suite.
6. Do not chase a coverage percentage. Use coverage to find untested risk, never as the acceptance criterion.
7. When the project already has tests for a module, extend its existing pattern instead of introducing a second style or a second runner.
8. Keep the "must always pass" suite small and fast enough that people actually run it before handoff.
9. Prefer testing the project's own contract over testing a library's behavior.
10. Do not build a test for a requirement nobody stated, including requirements invented to make a screen or endpoint look complete.

## Anti-patterns

Avoid:

- a large slow end-to-end suite covering what a unit test could catch;
- tests that assert a snapshot of everything, so every legitimate change breaks them;
- asserting on log lines, private fields, or call order unless that order is the requirement;
- testing only the paths that a happy-path demo exercises;
- adding a test framework the project did not choose.

## Output

Record for the change:

- the risks being protected against, in priority order;
- the level chosen for each test, with one sentence on why a lower level could not catch it;
- the failure paths that are now covered, and any risk left untested with the reason.
