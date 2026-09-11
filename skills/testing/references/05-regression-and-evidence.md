# 05 — Regression and Evidence

## Purpose

Turn every fixed bug into a test that cannot forget, and report verification honestly enough that someone else could reproduce it.

## Rules

1. Every bug fix gets a regression test that fails on the old behavior. Write the test first, watch it fail for the stated reason, then fix the bug.
2. Keep the regression test at the lowest level that reproduces the bug. If it only reproduces in a browser, keep it as a journey — and note that in the report.
3. Name the test after the failure it prevents, so the reason survives after the ticket is closed.
4. Add the rule that prevents the class of bug when there is one — a validation rule, a constraint, a lint rule, a guard — instead of only patching the single instance.
5. Run the narrowest relevant checks first, then broaden: the changed test, the owning module's tests, then the full suite and build in proportion to risk.
6. Do not report a suite as passing unless the command ran and its output was read. Never infer a pass from a previous run or from a successful build.
7. Record skipped checks and why they were skipped, and name any check that could not run at all.
8. Distinguish "the test exists" from "the behavior was observed": for UI and API changes, also record the browser or request evidence the `ui-ux` and `api` packs require.
9. Keep the verification report reproducible: exact command, environment, and observed result, not a summary judgment.
10. Treat a test that was silently removed, weakened, or skipped as a regression in its own right, and say so explicitly when it happens.

## Anti-patterns

Avoid:

- fixing the bug and writing the test afterward, without confirming the test would have caught it;
- a regression test that asserts the patched line rather than the broken behavior;
- "all tests pass" with no command, no scope, and no mention of what was skipped;
- deleting an inconvenient test to reach green;
- leaving a bug's reproduction only in chat history.

## Output

Report:

- the reproduction that failed before the fix, and the test that now pins it;
- the commands run, their scope, and their observed result;
- checks skipped, with the reason, and checks that could not run;
- the broader rule or guard added to prevent the same class of bug, if one was added;
- any evidence that still depends on manual verification.
