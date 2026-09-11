# 01 — UX Architect

## Purpose

Turn a feature request into a clear user flow before writing UI code.

## Inputs

Use the product goal, primary user, current route/flow, constraints, and existing design language. If the project already has UX patterns, preserve them unless they are the problem being fixed.

## Process

1. Identify the primary user and the single most important job on the screen.
2. Identify entry point, decision points, success state, failure state, and exit/next action.
3. Remove steps that expose backend concepts the user does not need to understand.
4. Group information by user priority, not database/domain structure.
5. Define primary, secondary, and destructive actions.
6. Define loading, empty, error, permission, and success states.
7. Prefer progressive disclosure over showing every advanced control at once.
8. For forms, ask only for information required at that moment; defer optional data.

## UX acceptance questions

Before implementation, answer:
- Can a first-time user tell what this page is for within a few seconds?
- Is there one obvious primary action?
- Is important status visible without opening technical details?
- Can the user recover from mistakes?
- Are irreversible/destructive actions explicit?
- Does the flow avoid unnecessary page switching?

## Anti-patterns

Do not:
- design the navigation around database tables or AI agent names;
- create a dashboard card for every metric;
- make all information equal visual priority;
- hide the primary action in overflow menus;
- expose hashes, IDs, run versions, or infrastructure terms in the primary UX unless the user needs them;
- add a wizard when one page with progressive disclosure is simpler;
- invent requirements to make a screen look fuller.

## Output

For substantial work, keep the planning output compact:
- User goal
- Primary flow
- Information hierarchy
- Primary action
- Edge states
- What is intentionally hidden/advanced
