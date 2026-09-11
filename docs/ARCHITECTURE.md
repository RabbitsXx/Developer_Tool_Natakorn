# Architecture and decision rules

## Reference flow

```text
Project entry
    ↓
START_PROMPT.md → .ai-kit/project.json
    ↓
NEW / EXISTING / RESUME classification
    ↓
Product intent + current repository evidence
    ↓
AI architect/reviewer ── AGENTS.md + project context
    ↓
Targeted discovery ───── search first + context budget
    ↓
Execution agent ──────── small verified changes
    ├── shell output ─── RTK when supported
    ├── repo context ─── Repomix only when genuinely broad
    └── external docs ── Jina Reader or Crawl4AI
    ↓
Web application
    ├── UI ───────────── project-selected framework/components
    ├── data ─────────── selected DB/provider + selected access layer
    ├── scheduled ────── simple scheduler when needed
    └── durable jobs ─── workflow engine only when needed
    ↓
Focused tests → lint/typecheck → build → browser/E2E
    ↓
Optional CI + production observability
    ↓
Selected deployment target
```

## Bootstrap ownership

The bootstrap layer is intentionally smaller than the application architecture. It detects and records what already exists; it does not own the application's framework, database, deployment, or optional tools.

`.ai-kit/project.json` is a commit-safe orientation cache containing non-secret architecture metadata and a stable fingerprint. `START_PROMPT.md` teaches a newly connected AI model how to interpret that state. If repository evidence changes, the detector reports drift instead of silently rewriting architecture decisions.

See `BOOTSTRAP_PROTOCOL.md` for mode rules.

## Database ownership

The kit does not choose a database provider or ORM before the project requirements are known.

Examples of valid combinations include:

- Neon/PostgreSQL + direct `pg`
- Neon/PostgreSQL + Drizzle
- Supabase + provider SDK + SQL migrations
- PostgreSQL + Prisma
- an existing project-specific data layer that should be preserved

Use this model:

- application schema/types belong in the selected data-access layer
- deployable database history belongs in migrations when the architecture uses them
- provider-specific behavior such as RLS, policies, grants, triggers, functions, extensions, and storage rules must remain represented in the provider/database layer
- generated migrations are reviewed before local or remote application

Do not replace an existing architecture just to match a preferred reference stack.

## Browser verification

Use Playwright for critical user journeys when repeatable browser verification is valuable. Keep the suite intentionally small: authentication, one or two core workflows, destructive-action guards, and other high-value flows.

A successful framework build proves compilation, not that clicks, forms, sessions, navigation, or browser-side behavior work correctly.

## CI and observability

CI and production observability are capability tiers, not mandatory dependencies. A solo prototype may rely on local verification; a shared or production project can opt into a lightweight CI gate and Sentry/OpenTelemetry or an existing operational standard.

Do not add deployment, observability, or CI services merely to make the toolchain look complete.

## Scheduled work

| Requirement | Choose |
|---|---|
| Simple schedule calling one idempotent endpoint | Vercel Cron |
| Retries, multiple steps, waits, fan-out, concurrency, or run history | Inngest |
| The same job needs both | Let one scheduler emit the event; never execute business logic twice |

Protect cron endpoints, make handlers idempotent, and remember that Vercel Cron runs on production deployments rather than Preview deployments.

## Web reading

| Requirement | Choose |
|---|---|
| One public URL to clean Markdown | Jina Reader |
| JavaScript rendering, multi-page crawl, structured extraction, local control | Crawl4AI |
| Private/authenticated content | Use an authorized local/browser path and never leak credentials |

Always respect access controls, terms, robots policies, copyright, and personal data.

## Containers

- Windows: Docker Desktop, Rancher Desktop, or Podman.
- macOS: OrbStack is a strong option; Docker Desktop, Rancher Desktop, and Podman are alternatives.
- Linux: Docker Engine/Desktop or Podman.

Supabase local development needs a Docker-compatible runtime. Managed Supabase does not require running the full local stack for every task.
