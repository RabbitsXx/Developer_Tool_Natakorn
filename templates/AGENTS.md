# Project-specific AI instructions

Read `PROJECT_CONTEXT.md`, `docs/run.md`, the repository README, and package manifests before changing code.

## Project purpose

<!-- What this project does and who uses it. -->

## Commands

- Install: `<!-- command -->`
- Development: `<!-- command -->`
- Test: `<!-- command -->`
- Build: `<!-- command -->`

## Rules

- Preserve existing user changes.
- Never commit secrets or production data.
- Use the package manager selected by the lockfile.
- Keep migrations and generated files reviewable.
- Run relevant lint, typecheck, tests, and build before handoff.
- Verify behavior in the real route or entrypoint when the change is user-facing.
- State assumptions and do not claim unrun checks passed.
