# Project-specific AI instructions

At the start of a session, read `.ai-kit/project.json` when present, then `START_PROMPT.md`, `PROJECT_CONTEXT.md`, `docs/run.md`, the repository README, and relevant manifests before changing work. Read `project.profile` and use `definitionOfDone` from every matched profile as the verification checklist. If state and source disagree, current repository evidence wins. Read matching project overlays under `.ai-kit/overlays/` within their stated scope.

## One-shot delivery protocol

- Before implementation, turn the request into a compact task brief: user outcome, concrete scope, repository constraints, observable acceptance cases, and verification steps. Use repository evidence and conventions to fill gaps instead of asking for facts already available.
- Apply a silent prompt-completeness gate to every nontrivial task. Load `prompt-enchant` when the user asks to improve a prompt, or when scope/acceptance is missing or the same correction recurs. For a clear small task, proceed without rewriting it.
- If the user asks only for a prompt, return a copy-ready prompt without executing it. If they ask for the work, use the brief internally and complete the task.
- For user-facing changes, capture the user, usage moment, intended outcome, task flow, and relevant visual, device, responsive, and accessibility constraints. For backend or tooling changes, capture the caller, contract, failure behavior, and operational constraints that apply.
- Keep acceptance cases and implementation constraints as build guidance; include them in visible product copy only when end users need them. For a short landing page, prioritize one audience, one benefit, and one primary action.
- Check the brief against the owning code, callers, and existing checks before editing. Include applicable empty, loading, error, boundary, permission, or rollback cases.
- Use a reversible project-consistent default for low-impact unknowns and state the assumption. Ask only if the answer materially changes product behavior, architecture, security, data handling, or a destructive action.
- Complete the scoped change, compare it with every acceptance case, and run the narrowest relevant verification. Fix a failed case at its source and rerun the check before handoff.
- When a correction recurs, consider preserving the learning in project instructions, an example, or a regression check.

When the kit checkout is available, see `docs/ONE_SHOT_WORKFLOW.md` for the task-brief template and research basis.

## Project purpose

<!-- What this project does and who uses it. -->

## Commands

- Install: `<!-- command -->`
- Development: `<!-- command -->`
- Test: `<!-- command -->`
- Build: `<!-- command -->`

## Skill pack activation

- Packs live at `.ai-kit/skills/<pack>/` (open Agent Skills format): a `SKILL.md` entry plus a `references/` directory.
- Resolve which packs are installed from the directories under `.ai-kit/skills/` and from `.ai-kit/project.json` → `capabilities.potentiallyUseful`; each `SKILL.md` frontmatter states its `name`, `description`, and scope. Do not rely on a pack list written in prose, and when the kit repository is available treat `toolchain.json` → `skills.packs` as the authoritative registered list.
- Open the one pack whose frontmatter description matches the task, then only the references that pack maps to; never load a whole pack or a pack "just in case".
- Boundaries that a description match alone gets wrong: `ui-ux` is the web visual/flow layer while `mobile` owns native lifecycle, offline/sync, permissions, builds, and store release; `data-layer` needs stored-data changes and `api` needs an HTTP surface; `security` and `testing` strengthen the owning pack instead of replacing it; `infrastructure` is not application feature code; `release` activates only once a release decision exists and production needs explicit authorization.
- Before mutating Git/database/cloud/container/remote systems in an installed project, classify the command with `node .ai-kit/bin/policy-check.mjs`; in the kit repository use `node scripts/policy-check.mjs`. Deny is a hard stop and approval-required needs explicit authorization. Keep decisions in `.ai-kit/audit/events.jsonl`.
- Use `node .ai-kit/bin/memory.mjs` for non-secret decisions, lessons, and handoff; use `node .ai-kit/bin/metrics.mjs` for task evidence. In the kit repository, use the matching `scripts/` paths.
- Reuse the existing design system first; do not add a second component library without a requirement.
- For the `web-app` profile, build success is not visual acceptance, and passing unit tests is not API verification. Verify the actual route in a browser; use Playwright and accessibility checks when configured.

## Context budget

- Search before reading broadly.
- Small task: start with at most 5 relevant files.
- Medium cross-layer task: start with at most 15 relevant files.
- Expand only when a discovered dependency requires it.
- Do not reread unchanged files without a reason.
- Use Repomix only for architecture-wide work or when targeted search cannot identify ownership.

## Bootstrap / resume

- Recognize `NEW_PROJECT`, `EXISTING_PROJECT`, and `RESUME_CONFIGURED_PROJECT`.
- New project: ask only requirement questions that materially affect architecture; choose the smallest stack.
- Existing project: preserve framework, lockfile/package manager, database/provider, data-access layer, deployment, tests, and unrelated user changes.
- Configured project: validate `.ai-kit/project.json`; do not reinstall or bootstrap again when the recorded architecture still matches. If drift is detected, inspect it first and use `--accept-drift` only after the change is understood and intentional.
- Never place secrets or raw `.env` values in `.ai-kit/project.json`.

## Rules

- Preserve existing user changes.
- Never commit secrets or production data.
- Use the package manager selected by the lockfile.
- Keep migrations and generated files reviewable.
- Run relevant lint, typecheck, tests, and build before handoff.
- Verify behavior in the real route or entrypoint when the change is user-facing; use Playwright for repeatable critical journeys when configured and `@axe-core/playwright` when accessibility automation is selected.
- Run Knip after substantial JS/TS feature churn when configured; review findings before deleting code.
- Keep Lefthook fast and local; it supplements but does not replace final verification or remote CI.
- Preserve the project's existing database/provider/ORM choice unless the task explicitly changes architecture.
- Never store secrets in `.ai-kit/memory/`, `.ai-kit/audit/`, or `.ai-kit/metrics/`.
- Current repository evidence wins over memory and generated state.

## Project overlays

Read matching `.ai-kit/overlays/<name>/OVERLAY.md` files within their stated scope. Overlays may add domain rules, but must never relax security, policy, or verification requirements.
