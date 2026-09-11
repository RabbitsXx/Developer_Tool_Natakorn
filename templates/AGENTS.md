# Project-specific AI instructions

At the start of a session, read `.ai-kit/project.json` when present, then `START_PROMPT.md`, `PROJECT_CONTEXT.md`, `docs/run.md`, the repository README, and package manifests before changing code. If state and source disagree, current repository evidence wins.

## Project purpose

<!-- What this project does and who uses it. -->

## Commands

- Install: `<!-- command -->`
- Development: `<!-- command -->`
- Test: `<!-- command -->`
- Build: `<!-- command -->`

## UI/UX skill activation

- For user-facing UI/UX work, read `.ai-kit/skills/ui-ux/README.md` when present and load only the smallest skill subset mapped to the task.
- Do not load UI/UX skills for backend/database/infrastructure-only tasks.
- Reuse the existing design system first; do not add a second component library without a requirement.
- Build success is not visual acceptance. Verify the actual route in a browser; use Playwright and accessibility checks when configured.

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
