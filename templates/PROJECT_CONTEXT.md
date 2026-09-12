# Project context

## AI Project Kit state

- Bootstrap state: `.ai-kit/project.json`
- Project mode: `<!-- NEW_PROJECT / EXISTING_PROJECT / RESUME_CONFIGURED_PROJECT -->`
- Architecture fingerprint reviewed: `<!-- yes/no -->`
- Last setup review: `<!-- date or not yet reviewed -->`

> `.ai-kit/project.json` is an orientation cache. Current repository evidence wins if it disagrees with this document or state.

## Safety and continuity state

- Command policy: `.ai-kit/policy.json` (deny-first); classify with `node scripts/policy-check.mjs`, execute approved commands with `node scripts/run-safe.mjs`
- Audit trail: `.ai-kit/audit/events.jsonl` (redacted, gitignored)
- Memory: `.ai-kit/memory/` — `decisions.jsonl`, `lessons.jsonl`, `handoff.md`
- Session evidence: `.ai-kit/metrics/events.jsonl` (gitignored)
- Designated execution environment: `<!-- local only / staging / production, with who authorizes what -->`

## Product

- Name: `<!-- project name -->`
- Purpose: `<!-- problem this product solves -->`
- Primary users: `<!-- user groups -->`
- Success metric: `<!-- observable business or user outcome -->`

## Scope

- Current milestone: `<!-- milestone -->`
- In scope: `<!-- concise list -->`
- Out of scope: `<!-- concise list -->`

## Architecture

- Runtime/framework: `<!-- detected or selected stack -->`
- Package manager: `<!-- npm/pnpm/yarn/bun -->`
- Database provider: `<!-- Neon / Supabase / PostgreSQL / other / none -->`
- Database access: `<!-- Drizzle / Prisma / pg / provider SDK / other / none -->`
- Auth/storage: `<!-- services or none -->`
- Deployment: `<!-- target -->`
- Background jobs: `<!-- none / Vercel Cron / Inngest / other -->`
- Browser E2E: `<!-- Playwright / other / none -->`
- Production observability: `<!-- Sentry / OpenTelemetry / existing standard / none -->`
- Remote CI: `<!-- GitHub Actions / other / none -->`

## Quality gates

- Lint: `<!-- command -->`
- Typecheck: `<!-- command -->`
- Test: `<!-- command -->`
- E2E/browser: `<!-- command or none -->`
- Build: `<!-- command -->`
- Preview: `<!-- URL or procedure -->`

## AI context budget

- Small task: start with up to 5 relevant files.
- Medium cross-layer task: start with up to 15 relevant files.
- Search before broad reads; expand only when dependencies require it.
- Repomix: `<!-- allowed for architecture-wide tasks / disabled / custom rule -->`

## Constraints and decisions

<!-- Record facts, important tradeoffs, and decisions. Do not put secrets here. -->
