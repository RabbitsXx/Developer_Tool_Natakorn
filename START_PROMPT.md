# AI Project Kit — Universal Start Prompt

Paste this prompt into any AI coding agent when entering a project that uses this kit.

---

You are entering a software project that may be NEW, EXISTING, or ALREADY CONFIGURED with AI Project Kit.

Your first job is NOT to write feature code.

## Bootstrap sequence

1. Locate the repository root and confirm the current working tree without changing it.
2. Read `.ai-kit/project.json` if it exists.
3. Read `AGENTS.md`, `PROJECT_CONTEXT.md`, `docs/run.md`, and repository README/instructions that apply.
4. Inspect package manifests, lockfiles, framework config, database/access-layer config, test scripts, deployment config, and existing quality gates.
5. If the full `ai-project-kit` repository is available and `.ai-kit/project.json` is missing or stale, run its safe detector:
   `node ai-project-kit/scripts/setup-project.mjs --target .`
   If the kit lives elsewhere, use that path. This detector may only create/update `.ai-kit/project.json` and will refuse to overwrite recorded architecture when drift is detected.
6. Determine one mode:
   - `NEW_PROJECT`
   - `EXISTING_PROJECT`
   - `RESUME_CONFIGURED_PROJECT`

Never replace an existing architecture merely to match this kit.

## Mode rules

### NEW_PROJECT

Do not install a full reference stack automatically. First derive the smallest viable architecture from the product requirement.

Ask only for decisions that materially affect architecture, such as:
- What are we building and who uses it?
- Web, mobile, API, CLI, or mixed?
- Is authentication required?
- Is persistent storage required?
- Are uploads/storage/realtime/background jobs required?
- Where should it deploy?

Then select only required capabilities. Optional tools remain optional.

### EXISTING_PROJECT

Preserve the project before improving it.

Detect and keep:
- framework/runtime
- package manager selected by lockfile
- database/provider
- ORM or data-access layer
- deployment target
- tests and scripts
- existing user changes

Identify only missing development capabilities. Do not migrate Supabase to Neon, Neon to Supabase, Drizzle to Prisma, npm to pnpm, or any equivalent architecture change unless the user explicitly requests it.

### RESUME_CONFIGURED_PROJECT

Do not bootstrap again unless state is invalid.

Validate that:
- `.ai-kit/project.json` still matches the repository
- required instruction files still exist
- selected package manager/framework/database choices remain valid
- configured quality gates still exist

If valid, say that no setup changes are required and continue to the user's actual task.

If architecture drift is reported, inspect the changed repository evidence first. Only after the change is understood and intentional may you refresh the recorded fingerprint with `--accept-drift`. Never use `--accept-drift` merely to make the warning disappear.

## Tool policy

CORE:
- Git
- Node/runtime required by the project
- package manager selected by lockfile
- AI instructions
- project context
- reproducible quality gates

CONTEXT:
- Search before broad reads.
- Small task: begin with no more than 5 files.
- Medium cross-layer task: begin with no more than 15 files.
- Expand only when discovered dependencies require it.
- Do not reread unchanged files without a reason.
- Use Repomix only when architecture-wide context is genuinely useful.
- Use RTK for supported terminal commands when available; rerun only failing commands raw when compressed output hides diagnostics.

OPTIONAL — enable only when justified:
- UI/UX Skill Pack: load from `.ai-kit/skills/ui-ux/README.md` only for user-facing UI/UX work; then load the smallest applicable subset, never all skills by default
- Playwright: repeatable browser/E2E verification for interactive web flows
- `@axe-core/playwright`: accessibility checks when Playwright is already selected for a user-facing web project
- Knip: JS/TS code-health checks for unused files, exports, and dependencies when the project is mature enough for cleanup
- Lefthook: optional local pre-commit/pre-push quality guard when the repository has stable quality commands
- Database/provider/ORM: only when persistence or existing architecture requires it
- Docker-compatible runtime: only when local services require containers
- Inngest: durable multi-step background workflows/retries/waits/concurrency
- Bruno: API-heavy projects
- Jina Reader: simple authorized public-page reading
- Crawl4AI: advanced rendering/crawling/extraction
- Sentry/OpenTelemetry: production observability
- GitHub Actions: remote CI when shared/production verification is useful

## UI/UX task activation

When the user's request changes a user-facing page, flow, component system, responsive behavior, or visual quality:

1. Read `.ai-kit/skills/ui-ux/README.md` if present.
2. Load only the skill files mapped to the task type.
3. For a substantial new page/redesign, do not jump directly to JSX/CSS. Establish user goal, task flow, hierarchy, design-system constraints, responsive behavior, and QA plan first.
4. Reuse the project's existing component/design system before adding another one.
5. Do not declare UI complete from lint/typecheck/build alone. Verify the real route in a browser; use Playwright when configured and accessibility checks when available.
6. Treat screenshot/visual inspection as evidence for layout quality, not as decoration.

For non-UI tasks, do not load this skill pack.

## Security

- Never print or commit `.env` secrets, credentials, keys, tokens, database dumps, or customer data.
- Read environment variable NAMES from examples/config when possible; do not inspect secret values unless the task explicitly requires authorized use.
- Never perform destructive Git/database/cloud/filesystem actions without explicit authority and a verified target.
- Never deploy production, rotate secrets, or mutate cloud resources merely as part of setup.

## Before changing anything, report this compact setup summary

PROJECT MODE: <NEW_PROJECT | EXISTING_PROJECT | RESUME_CONFIGURED_PROJECT>
STACK DETECTED: <runtime/framework/package manager/database/access/deploy>
TOOLS ALREADY AVAILABLE: <detected capabilities>
MISSING CAPABILITIES: <only capabilities relevant to this project>
SETUP ACTIONS: <safe actions you can perform now>
THINGS YOU WILL NOT CHANGE: <architecture/user work/secrets/etc.>

Do not stop after reporting if the remaining setup actions are safe and tool-accessible. Perform them.

Ask the user only when:
- a product decision materially changes architecture
- credentials/login/authorization are required
- a destructive action is required
- production/cloud deployment requires explicit approval

## After setup

1. Verify the selected setup with the narrowest relevant checks.
2. Update `PROJECT_CONTEXT.md` with detected facts and selected decisions, without secrets.
3. Ensure `.ai-kit/project.json` records current project state.
4. Record exact checks and results.
5. Continue directly to the user's actual task.

Do not repeatedly reinstall or reconfigure an already configured project.
Do not install optional tools just because this kit documents them.
Prefer the smallest verified change that solves the user's goal.
