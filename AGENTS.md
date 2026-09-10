# AI Operating Contract

These instructions apply to every task in this repository. When this kit is bootstrapped into another project, merge them with that project's existing instructions; project-specific requirements take precedence.

## Mission

Build software with evidence, reproducible setup, minimal context waste, and safe handoff. Do not treat the tool list as a requirement to install or use every tool.

## Startup protocol

1. Confirm the absolute working directory, repository root, current branch, remotes, and working-tree status.
2. Read all applicable `AGENTS.md`, `README.md`, `CONTRIBUTING.md`, project context, run, test, and deployment documents completely.
3. Detect the stack from source files, manifests, lockfiles, and framework configuration. Never replace an existing package manager or architecture merely to match this kit.
4. Preserve pre-existing and unrelated changes. Do not stage, overwrite, stash, clean, reset, or delete work you do not own.
5. Identify the smallest complete change, its acceptance criteria, and the commands needed to verify it.

## Tool-selection rules

- Prefer repository-local dependencies and scripts over global tools.
- Use the lockfile's package manager. Never create a second lockfile.
- Use RTK for supported shell commands when available. If compressed output hides diagnostic detail, rerun only the failing command without RTK and explain why.
- Use Repomix only when broad repository context is materially useful. Review its config and generated output before sharing it.
- Use Jina Reader for simple public pages. Use Crawl4AI only when rendering, crawling, extraction, or local control is required.
- Use Vercel Cron for a small idempotent scheduled HTTP task. Use Inngest for durable multi-step work, retries, concurrency, waits, or observability. Do not trigger the same business job from both.
- Use a Docker-compatible runtime only when local services require it. OrbStack is a macOS option, not a Windows default.

## Security and data rules

- Never print, commit, paste into documentation, or send secrets to an external service.
- Treat `.env*`, credentials, private keys, database dumps, customer data, Repomix outputs, screenshots, and logs as potentially sensitive.
- Keep only placeholder names in `.env.example`.
- Review third-party install scripts before executing them. Prefer checksummed release artifacts or trusted package managers.
- Do not run destructive Git, database, cloud, or filesystem operations without explicit authorization and verified targets.

## Database rules

- Keep deployable migration history under version control.
- Drizzle schema represents application-owned tables and types; SQL migrations must also cover Supabase RLS, policies, triggers, functions, grants, and extensions.
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
7. browser/Preview verification for user-facing behavior

Do not claim a check passed unless it ran successfully. Record skipped checks and the reason.

## Handoff

Lead with the outcome, then report changed areas, checks and results, preview/deploy location when applicable, remaining risks, and the next useful decision. Never claim generic vendor savings or “production-ready” status without measurements and project-specific evidence.

Read `SETUP.md`, `toolchain.json`, and the relevant document under `docs/` before changing setup behavior.
