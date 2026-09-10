# Standard Project Workflow for AI Agents

## 1. Discover

- Locate the repository root and applicable instruction files.
- Inspect Git state before consequential operations.
- Identify runtime, framework, package manager, database, tests, deployment target, and local services from existing files.
- Write missing run instructions as procedures, never secret values.

## 2. Reproduce

- Use the existing lockfile and documented runtime version.
- Copy local environment files only from a trusted checkout and keep them ignored.
- Install repository dependencies with the project's package manager.
- Start local dependencies only when required; bind development services to localhost.
- Apply migrations only to the explicitly selected local/test environment.

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
- Review `git diff` and confirm only intended files changed.

## 6. Ship

- Commit a coherent unit of work only when requested or when the task explicitly includes delivery to a repository.
- Push only to the authorized remote and branch.
- Never deploy production, change cloud configuration, or rotate secrets unless explicitly requested.
- Report exact verification evidence and known gaps.

## New project baseline

For a new Next.js project, prefer TypeScript, App Router, ESLint, Tailwind, a `src/` directory, and a committed lockfile. Add Supabase, Drizzle, shadcn/ui, Inngest, or Vercel configuration only when the product actually needs them.

Recommended script names are `dev`, `build`, `start`, `lint`, `typecheck`, `test`, and `format`. Existing projects keep their established names.
