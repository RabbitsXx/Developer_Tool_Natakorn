# Context efficiency for AI coding agents

The goal is not to minimize context at all costs. The goal is to load the smallest amount of trustworthy context required to make a correct change.

## Default retrieval order

1. Read applicable instructions and project context.
2. Search for the symbol, route, error, feature, or exact phrase first.
3. Read only the files that own the behavior.
4. Expand to callers, tests, schema, or shared components only when the dependency requires it.
5. Use Repomix only when the task is architecture-wide or the relevant ownership cannot be found efficiently through search.

## Context budget

Treat these as defaults, not hard safety limits:

| Task size | Initial file budget | Typical use |
|---|---:|---|
| Small | up to 5 files | one bug, component, route, test, or config change |
| Medium | up to 15 files | feature slice crossing UI/API/data/tests |
| Architecture-wide | targeted Repomix or deliberate expansion | migrations, large refactors, cross-domain design |

If the budget must be exceeded, explain the dependency that required broader context.

## Avoid repeated reads

Do not reread an unchanged file merely because another step started. Keep a short working map of:

- files already read
- ownership discovered
- contracts/invariants found
- checks already run

Reread only when the file may have changed, an exact line is needed, or previous context is no longer reliable.

## Terminal output

Use RTK when it supports the command. Prefer focused checks while implementing and broad checks before handoff.

If compressed output hides the cause of a failure:

1. rerun only the failing check without RTK
2. inspect the smallest useful raw section
3. return to compact output after diagnosis

Do not dump entire logs into model context when a summary plus the failing section is sufficient.

## Sub-agent / multi-agent rule

A delegated agent should receive:

- one goal
- explicit allowed scope
- acceptance criteria
- known files or search targets
- required verification
- a compact list of relevant invariants

Do not send the full repository or the full conversation by default.

A good delegation packet looks like:

```text
Goal: Fix mobile submit flow.
Scope: app/checkout + its tests only.
Known entry: app/checkout/page.tsx.
Invariant: payment mutation must remain server-side.
Verify: focused test, typecheck, browser flow.
Return: changed files + pass/fail evidence + remaining risk.
```

## Repomix rule

Repomix is an escalation tool, not the first retrieval step.

Use it when:

- ownership spans many domains
- architecture review genuinely needs broad context
- a migration/refactor touches many contracts
- search cannot identify the relevant slice

Always review ignore rules and generated output before sharing it with a model or external service.
