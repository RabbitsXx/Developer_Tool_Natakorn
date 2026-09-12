# AI Operating Contract

These instructions apply to every task in this repository. When this kit is bootstrapped into another project, merge them with that project's existing instructions; project-specific requirements take precedence.

## Mission

Build software with evidence, reproducible setup, minimal context waste, and safe handoff. Do not treat the tool list as a requirement to install or use every tool.

## Startup protocol

1. Confirm the absolute working directory, repository root, current branch, remotes, and working-tree status.
2. Read `.ai-kit/project.json` first when present. Treat it as an orientation cache, not as authority over current repository evidence.
3. Read `START_PROMPT.md` when present, then all applicable `AGENTS.md`, `README.md`, `CONTRIBUTING.md`, project context, run, test, and deployment documents.
4. Determine `NEW_PROJECT`, `EXISTING_PROJECT`, or `RESUME_CONFIGURED_PROJECT`. If the kit detector is available, use `node scripts/setup-project.mjs --target <project>` or the equivalent kit path to establish/refresh non-secret project state.
5. Detect the stack from source files, manifests, lockfiles, and framework configuration. Never replace an existing package manager or architecture merely to match this kit.
6. Preserve pre-existing and unrelated changes. Do not stage, overwrite, stash, clean, reset, or delete work you do not own.
7. Identify the smallest complete change, its acceptance criteria, and the commands needed to verify it.

Read `docs/BOOTSTRAP_PROTOCOL.md` before changing bootstrap/state behavior. A valid resume should continue the user's task without reinstalling or reconfiguring the project.

## Context-efficiency rules

- Search before reading broadly. Start with the symbol, route, error, feature, or exact phrase that owns the task.
- Initial context budget: up to 5 files for a small task and up to 15 files for a medium cross-layer task. Exceed the budget only when a discovered dependency requires it.
- Do not repeatedly reread unchanged files without a reason. Expand from owner files to callers, tests, schema, or shared components only as needed.
- Use Repomix only for architecture-wide tasks or when targeted search cannot identify the relevant slice.
- Delegated agents receive one goal, explicit scope, acceptance criteria, known entry points, invariants, and required verification — not the full repository or conversation by default.
- Read `docs/CONTEXT_EFFICIENCY.md` when changing agent/context behavior.

## Skill pack activation

Skill packs live in `.ai-kit/skills/<pack>/` and follow the open Agent Skills format: a `SKILL.md` entry plus a `references/` directory.

Resolve which packs exist from files or the manifest, never from a pack list written in prose, because prose lists drift:

- installed packs: the directories under `.ai-kit/skills/`, where each `SKILL.md` frontmatter states its `name`, `description`, and scope
- the kit's registered list with `activation`, `summary`, and `recommendFor` traits: `toolchain.json` → `skills.packs`
- what the detector suggests for this project: `.ai-kit/project.json` → `capabilities.potentiallyUseful`

Open the one pack whose frontmatter description matches the task, then open only the reference files that pack maps to. Never load a whole pack, and never load a pack "just in case".

Boundaries that a description match alone gets wrong:

- `ui-ux` owns the visual and flow layer of a web UI; `mobile` owns native platform behavior — lifecycle, offline/sync, permissions, device builds, and store release.
- `data-layer` applies only when stored data changes, and `api` only when an HTTP surface changes; pure UI work loads neither.
- `security` and `testing` are cross-cutting: they strengthen the pack that owns the change instead of replacing it.
- `infrastructure` covers pipelines, runtimes, cloud, and networking — not application feature code.
- Do not load a pack for work it does not cover: no `ui-ux` for backend, database, infrastructure, or documentation-only tasks; no `api` for pure UI work; no `data-layer` for tasks that do not change stored data; no `security` for cosmetic-only work; no `infrastructure` for application-only changes; no `mobile` for browser-only work; no `release` for feature work that has not reached a release decision.
- Substantial UI work must establish user goal, task flow, hierarchy, responsive behavior, and browser/visual QA before it is considered complete.
- Reuse the project's existing design system/components before adding another UI library.
- Build success is not visual acceptance, and passing unit tests is not API or data verification. Verify changed routes in a real browser (Playwright and `@axe-core/playwright` when configured), exercise changed endpoints with real requests including a failure path and an authorization-negative case, and apply data changes to a local or explicitly authorized database with the rollback path and constraints checked.

- Before a mutating Git/database/cloud/container/remote command, run `node scripts/policy-check.mjs --target . --command "..."`; deny is a hard stop, approval-required needs explicit authorization, and decisions are appended to `.ai-kit/audit/events.jsonl`.
- Use `node scripts/run-safe.mjs --command "..." --approved --reason "..."` only after an approval-required command has been explicitly authorized; never bypass the policy with a raw shell command when the gate applies.
- Persist only non-secret decisions, lessons, and handoff context under `.ai-kit/memory/`; record task metrics when available with `scripts/metrics.mjs` and run `scripts/eval-kit.mjs` for deterministic kit-contract checks.

- Prefer repository-local dependencies and scripts over global tools.
- Use the lockfile's package manager. Never create a second lockfile.
- Use RTK for supported shell commands when available. If compressed output hides diagnostic detail, rerun only the failing command without RTK and explain why.
- Use Repomix only when broad repository context is materially useful. Review its config and generated output before sharing it.
- Use Jina Reader for simple public pages. Use Crawl4AI only when rendering, crawling, extraction, or local control is required.
- Use Vercel Cron for a small idempotent scheduled HTTP task. Use Inngest for durable multi-step work, retries, concurrency, waits, or observability. Do not trigger the same business job from both.
- Use Playwright for critical user-facing browser journeys when UI behavior must be verified beyond lint/typecheck/build.
- Use `@axe-core/playwright` with Playwright for repeatable accessibility checks when the project selects that capability.
- Use Knip for periodic JS/TS code-health checks after substantial feature churn; review findings before deletion because dynamic/runtime entry points can look unused.
- Use Lefthook only when stable repository quality commands exist; hooks should be fast and should not replace full CI or final verification.
- Use production observability (Sentry, OpenTelemetry, or the project's existing standard) only when operational visibility is required; do not stack multiple observability systems without a reason.
- Use a Docker-compatible runtime only when local services require it. OrbStack is a macOS option, not a Windows default.

## Security and data rules

- Never print, commit, paste into documentation, or send secrets to an external service.
- Treat `.env*`, credentials, private keys, database dumps, customer data, Repomix outputs, screenshots, and logs as potentially sensitive.
- Keep only placeholder names in `.env.example`.
- Review third-party install scripts before executing them. Prefer checksummed release artifacts or trusted package managers.
- Do not run destructive Git, database, cloud, or filesystem operations without explicit authorization and verified targets.

## Database rules

- Detect and preserve the project's selected database provider and access layer. Do not force Supabase, Neon, Drizzle, Prisma, or direct `pg` merely because this kit supports them.
- Keep deployable migration history under version control whenever the selected database architecture uses migrations.
- ORM/schema definitions do not replace provider-specific database behavior such as RLS, policies, grants, triggers, functions, extensions, or storage rules.
- Review generated migrations before applying them.
- Never run a destructive migration against a linked remote database unless the user explicitly names the environment and authorizes it.

## Verification protocol

Run the narrowest relevant checks first, followed by broader checks when practical:

1. formatter/check
2. linter
3. typecheck
4. focused tests
5. full tests
6. production build
7. browser/Preview verification for user-facing behavior; prefer Playwright for repeatable critical journeys when configured

Do not claim a check passed unless it ran successfully. Record skipped checks and the reason.

## Handoff

Lead with the outcome, then report changed areas, checks and results, preview/deploy location when applicable, remaining risks, and the next useful decision. Never claim generic vendor savings or “production-ready” status without measurements and project-specific evidence.

Read `SETUP.md`, `toolchain.json`, and the relevant document under `docs/` before changing setup behavior.
