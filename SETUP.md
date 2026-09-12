# Standard Project Workflow for AI Agents

## 0. Bootstrap / Resume

- Read `.ai-kit/project.json` first when it exists, then `START_PROMPT.md` and project instructions.
- If the kit detector is available, run `node scripts/setup-project.mjs --target <project>` (or the equivalent kit path) to establish/refresh non-secret state.
- Classify the project as `NEW_PROJECT`, `EXISTING_PROJECT`, or `RESUME_CONFIGURED_PROJECT`.
- `NEW_PROJECT`: do not select the full stack until product requirements justify it.
- `EXISTING_PROJECT`: preserve existing architecture and add only missing development capabilities.
- `RESUME_CONFIGURED_PROJECT`: if architecture fingerprint is unchanged, do not reinstall/reconfigure; continue the actual task. If drift is detected, inspect it first; update the stored fingerprint only with an intentional `--accept-drift` run.
- See `docs/BOOTSTRAP_PROTOCOL.md` for the state schema and drift rules.

## 1. Discover

- Locate the repository root and applicable instruction files.
- Inspect Git state before consequential operations.
- Identify runtime, framework, package manager, database/provider, data-access layer, tests, deployment target, and local services from existing files.
- Search for the owning symbol/route/feature before reading broad directories.
- Start with a context budget of up to 5 files for small tasks and up to 15 for medium cross-layer tasks; expand only when dependencies require it.
- Write missing run instructions as procedures, never secret values.

## 2. Reproduce

- Use the existing lockfile and documented runtime version.
- Copy local environment files only from a trusted checkout and keep them ignored.
- Install repository dependencies with the project's package manager.
- Start local dependencies only when required; bind development services to localhost.
- Apply migrations only to the explicitly selected local/test environment.

## Skill pack activation

- Packs live at `.ai-kit/skills/<pack>/` in the open Agent Skills format: a `SKILL.md` entry plus a `references/` directory.
- Resolve which packs exist from the filesystem or the manifest, never from a pack list written in prose: the directories under `.ai-kit/skills/`, the registered list in `toolchain.json` → `skills.packs`, or `.ai-kit/project.json` → `capabilities.potentiallyUseful`.
- Open the one pack whose frontmatter description matches the task, then only the references that pack maps to; never load a whole pack or a pack "just in case".
- Boundaries that a description match alone gets wrong: `ui-ux` is the web visual/flow layer while `mobile` owns native lifecycle, offline/sync, permissions, builds, and store release; `data-layer` needs stored-data changes and `api` needs an HTTP surface; `security` and `testing` strengthen the owning pack instead of replacing it; `infrastructure` is not application feature code.
- Before mutating Git, database, cloud, container, or remote systems, classify the command with `node scripts/policy-check.mjs`; deny is a hard stop and approval-required needs explicit authorization. Decisions are appended to `.ai-kit/audit/events.jsonl`.
- Persist only non-secret decisions, lessons, and handoff context with `node scripts/memory.mjs`; record session evidence with `node scripts/metrics.mjs`.
- For substantial UI work, define user goal, task flow, hierarchy, design-system constraints, responsive behavior, and visual/browser QA before implementation is considered complete.
- Release work activates only once a release decision exists; preparing or executing a deploy, planning rollback, or verifying a release requires explicit authorization for production.

## 3. Plan

- Translate the request into observable acceptance criteria.
- Separate facts found in the repository from assumptions.
- Ask only when a missing decision materially changes the result or requires new authority.
- Prefer a small vertical slice that can be verified end-to-end.

## 4. Implement

- Follow existing patterns and shared components.
- Keep domain logic separate from UI and transport code.
- Add loading, empty, success, and error states where relevant.
- Maintain accessibility, responsive behavior, and keyboard operation for UI changes.
- Avoid mock business data in production-facing flows unless clearly marked as fixture/demo data.

## 5. Verify

- Run focused checks during implementation.
- Before handoff, run the available lint, typecheck, tests, and production build in proportion to risk.
- Test changed UI behavior in a real browser/Preview, including navigation and console/server errors.
- For repeatable critical user journeys, prefer project-local Playwright when configured; a production build alone does not prove UI behavior.
- For production projects, verify the selected observability path can surface meaningful runtime failures without logging secrets or unnecessary personal data.
- Review `git diff` and confirm only intended files changed.
- When the task changes this kit itself (templates, `toolchain.json`, or bootstrap scripts), run `node scripts/validate-kit.mjs` and `node scripts/verify-bootstrap-protocol.mjs` and require `ok: true` before handoff. If `toolchain.json` `skills.packs` changed, run `node scripts/sync-skill-docs.mjs` first so the generated pack tables in `README.md` and `docs/INSTALLATION.md` match the manifest.

## 6. Ship

- Commit a coherent unit of work only when requested or when the task explicitly includes delivery to a repository.
- Push only to the authorized remote and branch.
- Never deploy production, change cloud configuration, or rotate secrets unless explicitly requested.
- Report exact verification evidence and known gaps.

## New project baseline

For a new Next.js project, prefer TypeScript, App Router, a linter, Tailwind when useful, a `src/` directory, and a committed lockfile. Choose the database provider and access layer from product requirements — for example Neon, Supabase, another PostgreSQL provider, Drizzle, Prisma, direct `pg`, or an existing provider SDK. Add shadcn/ui, Playwright, Inngest, Vercel, observability, containers, or other capabilities only when the product actually needs them.

Recommended script names are `dev`, `build`, `start`, `lint`, `typecheck`, `test`, and `format`; add `test:e2e` when Playwright or another browser suite is selected. Existing projects keep their established names.

See `docs/BOOTSTRAP_PROTOCOL.md` for project entry/resume rules, `docs/CONTEXT_EFFICIENCY.md` for context-budget rules, `.ai-kit/skills/<pack>/SKILL.md` for task-scoped UI/API skills after bootstrap, and `docs/QUALITY_AND_PRODUCTION.md` for Playwright, accessibility, Knip, Lefthook, optional CI, and observability guidance.
