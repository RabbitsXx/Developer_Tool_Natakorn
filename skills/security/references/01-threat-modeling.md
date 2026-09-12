# 01 — Threat modeling

## Purpose

Identify what can be abused before implementation makes the boundary expensive to change.

## Rules

1. Map actors, assets, entrypoints, trust boundaries, privileged operations, and external dependencies.
2. Write the top abuse cases in concrete terms: who can do what, to which asset, through which input.
3. Choose the smallest control that blocks or limits each abuse case, and assign an owner for residual risk.

## Anti-patterns

Avoid:

- generic claims such as “the endpoint is secure” without naming the boundary;
- treating the browser, queue, webhook, or internal service as trusted merely because it is “ours.”

## Output

Record the threat model, controls, assumptions, and unresolved risk.
