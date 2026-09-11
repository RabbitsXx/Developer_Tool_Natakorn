# Installation guide

Install workstation tools globally only when they are shared across projects. Keep application dependencies project-local and committed through a lockfile.

## Project bootstrap and first AI session

After cloning the kit and before asking an AI agent to change a target project, run the bootstrap script for that target. Bootstrap adds missing instruction files without overwriting existing ones, then writes a non-secret `.ai-kit/project.json` state file.

Windows:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\bootstrap-project.ps1 -TargetPath C:\path\to\project
```

macOS/Linux:

```bash
bash scripts/bootstrap-project.sh /path/to/project
```

Then open the target project's `START_PROMPT.md` and paste it into the AI coding agent. The agent must distinguish `NEW_PROJECT`, `EXISTING_PROJECT`, and `RESUME_CONFIGURED_PROJECT` before changing setup.

You can refresh or inspect project state directly:

```text
node scripts/setup-project.mjs --target /path/to/project
node scripts/setup-project.mjs --target /path/to/project --dry-run
```

See `docs/BOOTSTRAP_PROTOCOL.md` for state and drift rules.

## Required baseline

- Git
- Node.js 22 or newer for current Repomix requirements
- One package manager selected per project (`npm`, `pnpm`, `yarn`, or `bun`)
- RTK is recommended for AI-driven terminal sessions

Run the doctor first:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\doctor.ps1
```

```bash
bash scripts/doctor.sh
```

## Installation gates

Use the following gates instead of installing every tool globally:

1. **Baseline** — Git, Node.js 22+, one package manager, and RTK. `doctor.ps1 -Strict` (or `doctor.sh --strict`) must report zero required/recommended issues.
2. **Project-local tools** — install Playwright, Repomix, Bruno, database SDK/ORM, Inngest, or Crawl4AI only when the project context selects them. Keep dependencies and lockfiles in that project.
3. **Cloud services** — Neon, Supabase, Vercel, Inngest, Sentry/observability providers, and Jina Reader require the appropriate account/project configuration and secrets outside Git. A CLI being installed is not proof that the cloud integration works.

The setup is complete for a project only after its selected tools pass their verify commands and the project’s own lint, typecheck, test, build, and route checks pass. A previously configured project should resume from `.ai-kit/project.json` rather than reinstalling tools simply because a new AI model/session entered the repository.

## RTK

First verify that the installed `rtk` is Rust Token Killer:

```text
rtk --version
rtk gain
```

### Windows

Download `rtk-x86_64-pc-windows-msvc.zip` and `checksums.txt` from the official GitHub release, verify the SHA-256 checksum, extract `rtk.exe` into a user-local directory, and add that directory to `PATH`.

### macOS / Linux

```bash
curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/master/install.sh | sh
```

or:

```bash
brew install rtk-ai/tap/rtk
```

Cargo is an advanced fallback. Do not use bare `cargo install rtk` because another crate has the same name:

```bash
cargo install --git https://github.com/rtk-ai/rtk --branch master rtk
```

After installation, initialize the integration supported by your AI agent. Verify the generated instruction/hook files before committing anything project-specific.

## Repomix

Prefer on-demand use so the tool does not silently drift as a global dependency:

```text
npx repomix@latest
```

For reproducible automation, add a pinned dev dependency to the target project and commit its lockfile.

Review `repomix.config.json`, `.repomixignore`, and the generated output before sending it to any model or external service.

## Bruno

- Windows: `winget install Bruno.Bruno`
- macOS: `brew install bruno`
- Linux: use the official `.deb`, `.rpm`, AppImage, Flatpak, Snap, or documented APT repository.

Store Bruno collections in the application repository, but keep environment secrets outside Git.

## Container runtime

Choose one runtime only:

- Windows: Docker Desktop, Rancher Desktop, or Podman.
- macOS: OrbStack, Docker Desktop, Rancher Desktop, or Podman.
- Linux: Docker Engine/Desktop or Podman.

Verify before starting Supabase local:

```text
docker version
docker compose version
```

## Project-local web stack

For a new project with no existing architecture, Next.js + TypeScript is a strong default:

```text
npx create-next-app@latest my-app --ts --eslint --tailwind --src-dir --app --import-alias "@/*"
```

Then select only capabilities required by the product. Database and data-access choices are independent decisions: Neon, Supabase, another PostgreSQL provider, Drizzle, Prisma, direct `pg`, or a provider SDK can all be correct depending on the project.

Do not replace an existing database/provider/ORM merely to conform to this kit. Commit the package-manager lockfile and deployable database history when the architecture uses migrations.

Do not install Vercel, Supabase, Drizzle, Prisma, Inngest, Playwright, observability SDKs, or Crawl4AI globally merely because they appear in the ecosystem.

## Skill packs

Bootstrap synchronizes every pack registered in `toolchain.json` under `skills.packs` into `.ai-kit/skills/<pack>`, driven by `scripts/sync-skills.mjs`. No package is installed. The table below is generated from `skills.packs` in `toolchain.json`: to add or change a pack, edit the manifest and run `node scripts/sync-skill-docs.mjs`. Never edit the generated block by hand.

<!-- skill-packs:start (generated from toolchain.json; run: node scripts/sync-skill-docs.mjs) -->

_5 packs are registered in `toolchain.json` under `skills.packs`; each one is a folder with `SKILL.md` plus `references/` in the open Agent Skills format._

| Pack | Source | Bootstrapped to | Use when |
|---|---|---|---|
| `ui-ux` | `skills/ui-ux` | `.ai-kit/skills/ui-ux` | User-facing pages, flows, component systems, responsive behavior, and visual QA. |
| `api` | `skills/api` | `.ai-kit/skills/api` | HTTP endpoints and route handlers, request/response contracts, error shapes, authorization boundaries, and API tests. |
| `data-layer` | `skills/data-layer` | `.ai-kit/skills/data-layer` | Schema and constraint design, migration safety and rollback, query and index work, tenant scoping, data verification. |
| `testing` | `skills/testing` | `.ai-kit/skills/testing` | Choosing what to verify, test levels, browser journeys, flakiness and test data, regression tests. |
| `release` | `skills/release` | `.ai-kit/skills/release` | Planning and executing a production release safely: preflight verification, deploy execution, rollback readiness, release observability, and post-release confirmation. |

<!-- skill-packs:end -->

Each pack follows the open Agent Skills format described at `agentskills.io/specification`: a `SKILL.md` with YAML frontmatter (name, description, compatibility, metadata) plus a `references/` directory, so harnesses that discover skills can load it without rewriting anything.

AI agents should activate one pack at a time, and only when the task matches it: read `SKILL.md` first, then open only the reference files the task maps to. Never load a whole pack for a small change.

To use a pack in a specific harness, copy or symlink its folder into that harness's skills directory:

```text
.claude/skills/ui-ux     # Claude Code, and harnesses that read .claude/skills
.cursor/skills/api       # Cursor (Cursor also loads .claude/skills and .codex/skills)
```

Keep `.ai-kit/skills/` as the source of truth after bootstrap: a symlink stays in sync automatically, while a plain copy must be refreshed when the kit updates. Adding a pack is one command when the default shape fits:

```bash
node scripts/new-skill.mjs --id release \
  --summary "Release and rollback procedure for a deployment." \
  --summary-th "ขั้นตอน release และ rollback ของการ deploy" \
  --recommend web-framework \
  --reference 01-preflight --reference 02-deploy --reference 03-rollback
```

This creates `skills/release/SKILL.md` plus one file per `--reference`, registers the pack under `skills.packs` in `toolchain.json` (inserted textually, so the manifest diff stays one block), and regenerates the pack tables. The generated files are valid but unfinished: fill in every `<!-- TODO -->` marker, then run `node scripts/validate-kit.mjs`, which reports the pack under `skillPacksPendingContent` until the markers are gone. Add `--dry-run` to preview without writing.

Manual registration still works and is equivalent: write the pack folder, then add the entry under `skills.packs` with `summary`, `summaryTh`, `activation`, and `recommendFor`. Both bootstrap scripts and the detector pick a new pack up without code changes, because they read the manifest. Then run `node scripts/sync-skills.mjs --target <project>` for an existing project and `node scripts/sync-skill-docs.mjs` to regenerate the pack tables; `validate-kit.mjs` fails until those tables match. Validate a pack folder with the Agent Skills `skills-ref` tool if it is available.

## Playwright

For user-facing projects that need repeatable browser verification, install Playwright project-locally:

```text
npm install -D @playwright/test
npx playwright install
```

An optional starting config is available at `templates/optional/playwright.config.ts`. Copy and adapt it only after checking the project's package manager, dev command, port, authentication needs, and CI environment.

When accessibility automation is useful, add `@axe-core/playwright` project-locally and adapt `templates/optional/accessibility.spec.ts`.

For JavaScript/TypeScript cleanup after substantial AI-driven changes, add Knip only when needed and start from `templates/optional/knip.jsonc`. Review findings before deleting anything.

Lefthook is optional for fast local Git quality hooks; adapt `templates/optional/lefthook.yml.example` only after stable lint/test commands exist. Hooks supplement final verification and CI rather than replacing them.

Prefer a small set of critical journeys over a large fragile E2E suite.

## Optional CI and observability

`templates/optional/github-actions-ci.yml` is a lightweight starting point for remote lint/typecheck/test/build verification. It is intentionally not bootstrapped into every project.

Production observability should use Sentry, OpenTelemetry, or the project's existing standard when runtime visibility is needed. Keep telemetry free of secrets and unnecessary personal data. See `docs/QUALITY_AND_PRODUCTION.md`.

## Crawl4AI and Jina Reader

Jina Reader needs no local installation for basic use; prepend `https://r.jina.ai/` to an authorized public URL.

Install Crawl4AI in a project-specific Python virtual environment because its browser and model dependencies are substantial:

```text
python -m venv .venv
python -m pip install crawl4ai
python -m playwright install
```

The current Crawl4AI package declares Python 3.10 or newer. Recheck the package metadata when setting up a future machine because browser and model dependencies change independently.
