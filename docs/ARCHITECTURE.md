# Architecture and decision rules

## Reference flow

```text
Product intent
    ↓
AI architect/reviewer ── AGENTS.md + project context
    ↓
Execution agent ──────── small verified changes
    ├── shell output ─── RTK when supported
    ├── repo context ─── Repomix only when needed
    └── external docs ── Jina Reader or Crawl4AI
    ↓
Next.js application
    ├── UI ───────────── Tailwind + shadcn/ui
    ├── data ─────────── Supabase Postgres + Drizzle
    ├── scheduled ────── Vercel Cron (simple)
    └── durable jobs ─── Inngest (complex)
    ↓
Tests + Preview + production build
    ↓
GitHub → Vercel / selected deployment target
```

## Database ownership

The original “one `drizzle/schema.ts` file is always the single source of truth” rule is too narrow for Supabase.

Use this model:

- `src/db/schema/`: Drizzle definitions for application-owned tables and TypeScript queries.
- `supabase/migrations/`: ordered, deployable database history.
- SQL migrations: RLS, policies, grants, triggers, functions, extensions, and storage rules.
- Generated migrations: always reviewed before local or remote application.

As a project grows, split Drizzle schema by domain and export from an index; forcing every table into one file increases merge conflicts and context noise.

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
