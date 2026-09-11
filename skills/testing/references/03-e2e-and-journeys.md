# 03 — End-to-End and Journeys

## Purpose

Keep browser and full-stack tests focused on the few journeys where a real user, a real session, or a real database is the only way to know the truth.

## Rules

1. Choose a small set of journeys: sign-in and sign-out, the one or two core workflows, a destructive-action guard, and any flow that moves money or irreversible state. Everything else belongs at a lower level.
2. Run against the real application and a disposable database or environment, seeded deterministically, rather than against a stubbed backend that always agrees with the front end.
3. Drive the interface the way a user does: reach controls by role and accessible name, prefer user-visible text over CSS classes, and never depend on layout position that a redesign will change.
4. Wait for conditions — an element, a response, a URL — not for a fixed number of milliseconds. A `sleep` is a future flake.
5. Assert the outcome the user can observe: the destination, the persisted change, the visible error. A screenshot alone is decoration unless it is compared against a stable baseline.
6. Start each journey from a known state, with its own account or tenant, so parallel runs and reruns do not collide.
7. Verify the negative case where it matters: an unauthorized user cannot reach the flow, and a destructive action asks for confirmation.
8. Keep credentials and tokens out of the test files; read them from ignored environment files, and use purpose-built test accounts only.
9. When accessibility automation is configured, include the automated scan for changed pages, and keep manual judgment for what automation cannot see.
10. Keep the journey suite fast enough to run on demand. If a journey is slow only because it is broad, split the assertion out to a lower level.

## Anti-patterns

Avoid:

- an end-to-end test for every small behavior;
- selectors tied to class names, DOM structure, or nth-child positions;
- hard-coded waits, or retries that hide a race;
- journeys that depend on data left behind by another run;
- pointing tests at production or at shared staging data other people rely on;
- claiming a flow is verified from a screenshot of the first screen only.

## Output

Record for the change:

- the journeys added or modified, and the user risk each one protects;
- the environment and seed state they run against;
- the negative cases exercised;
- any journey deliberately left to manual verification, with the reason.
