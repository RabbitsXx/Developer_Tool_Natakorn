# 03 — Production UI Builder

## Purpose

Implement UI that is understandable, maintainable, accessible, and grounded in real product data.

## Build rules

1. Inspect the existing page, shared components, and data contract before creating new components.
2. Reuse shared components and patterns; create a new abstraction only when repetition or behavior justifies it.
3. Keep domain/business logic out of presentation components when practical.
4. Use semantic HTML and accessible names for interactive controls.
5. Primary actions must look primary; destructive actions must be visually and verbally explicit.
6. Implement loading, empty, error, permission-denied, and success states when the route can reach them.
7. Never display mock KPI/business data as production data. If fixture/demo content is necessary, label it unmistakably.
8. Avoid technical language in primary UI unless the target user is technical.
9. Prefer clear copy over decorative labels. Button text should describe the action.
10. Keep components small enough to reason about, but do not fragment simple markup into unnecessary abstractions.

## Data and state

- Missing data is not automatically zero.
- Unknown/unavailable states must remain distinguishable from real zero values.
- If an action is asynchronous, communicate pending/success/failure states and prevent accidental duplicate submission when needed.
- Preserve authorization and backend invariants; never bypass server rules to make the UI flow easier.

## Interaction quality

Verify:
- focus order and keyboard operation;
- visible focus state;
- labels for fields and icon-only buttons;
- disabled vs unavailable vs loading are distinguishable;
- errors explain what the user can do next;
- links and buttons use the correct semantic element.

## Completion rule

Implementation is not complete at `build: PASS`. For user-facing changes, continue through responsive and visual QA using the applicable skills in this pack.
