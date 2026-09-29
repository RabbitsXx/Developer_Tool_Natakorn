# Context efficiency for AI coding agents

The goal is not to minimize context at all costs. The goal is to load the smallest amount of trustworthy context required to make a correct change.

## Repository hygiene is context efficiency

Agent slowness and token waste are usually repo-state problems, not model problems. Before blaming the model, measure:

```bash
git status --short | wc -l          # dirty/untracked count the agent re-reads every session
git ls-files --others | wc -l       # untracked files that pollute glob/search results
du -sk <untracked dirs>             # scratch/output weight sitting in the worktree
```

Known failure pattern (real case, 2026-09): a project accumulated 722 untracked scratch files (~103MB) with no ignore rules, plus three fully duplicated code folders left by an old migration. Every `git status`, glob, and code search dragged scratch names into context, and tsc/lint processed the duplicated folders twice. One pre-existing lint error inside a scratch dir re-tripped in every session.

Fix in this order:

1. Ignore scratch/output directories first (`tmp/`, `output/`, `artifacts/`, runtime caches, root-level logs). This alone often shrinks git status and search noise immediately.
2. `git rm --cached` any tracked build artifacts/logs; then delete the local files if they are stale.
3. Before deleting a suspected duplicate folder: grep the codebase for imports of that path, compare files with `cmp`, and keep the newer/diverged copy. Then `git rm -r` the stale copy and remove its now-dead ignore entries from tsconfig/eslint.
4. Add scratch directories to lint ignores so stale errors in them stop failing every session's `npm run lint`.
5. Verify with typecheck + lint after the cleanup; the expected result is fewer errors than before, not new ones.

## Handoff files that stay small

A rolling implementation-notes file grows unbounded and becomes a fixed tax: every resuming session reads all of it. Keep instead:

- a `<2KB` quick-handoff doc as the default entry point: current state, missing inputs, hard rules, known-failing checks
- the long notes file marked as read-only history, consulted by section only
- use the five-line handoff contract (deviations, most-likely-revisit, edge cases, verification, next session) for summaries

## MCP response payloads

For MCP servers exposed to chat clients:

- Do not duplicate the same metadata JSON in both `content[].text` and `structuredContent`. Keep one authoritative copy in `structuredContent` and make the text block a single short human-readable line.
- Return binaries with proper content types (`image`, `resource` with base64 blob), never as raw text, or clients may read megabytes into model context.
- Keep tool `description` fields tight; they are read on every tool discovery, not once.

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
