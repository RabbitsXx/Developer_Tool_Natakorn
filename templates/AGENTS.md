# Project-specific AI instructions

At the start of a session, read `.ai-kit/project.json` when present, then `START_PROMPT.md`, `PROJECT_CONTEXT.md`, `docs/run.md`, the repository README, and package manifests before changing code. If state and source disagree, current repository evidence wins.

## Project purpose

<!-- What this project does and who uses it. -->

## Commands

- Install: `<!-- command -->`
- Development: `<!-- command -->`
- Test: `<!-- command -->`
- Build: `<!-- command -->`

## Skill pack activation

- Packs live at `.ai-kit/skills/<pack>/SKILL.md` (open Agent Skills format). Read only the pack that matches the task, then only the references it maps to.
- UI work: `.ai-kit/skills/ui-ux/SKILL.md` for user-facing routes and flows. Do not load it for backend/database/infrastructure-only tasks.
- API work: `.ai-kit/skills/api/SKILL.md` for endpoints, request/response contracts, authorization boundaries, and API tests.
- Data work: `.ai-kit/skills/data-layer/SKILL.md` for schema, migration, query, and data-access changes.
- Test work: `.ai-kit/skills/testing/SKILL.md` for test selection, regression tests, and what CI should gate.
- Release work: `.ai-kit/skills/release/SKILL.md` for deploy preflight, execution, rollback planning, and post-release verification; production deployment requires explicit authorization.
- Reuse the existing design system first; do not add a second component library without a requirement.
- Build success is not visual acceptance, and passing unit tests is not API verification. Verify the actual route in a browser; use Playwright and accessibility checks when configured.

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
- State assumptions and do not claim unrun checks passed.
