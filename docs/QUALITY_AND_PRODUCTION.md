# Web quality and production gates

This kit separates local correctness from production confidence. A successful build is necessary but not sufficient for user-facing web behavior.

## User-facing web quality

For projects with interactive UI, Playwright is the recommended E2E/browser layer.

Use it to verify the behavior that unit tests and builds cannot prove:

- navigation and route rendering
- form input and submission
- authentication/session flow
- loading, empty, success, and error states
- keyboard interaction where relevant
- browser console errors
- critical network failures
- screenshot evidence when visual behavior changed materially

Install it project-locally only when the project needs browser E2E:

```text
npm install -D @playwright/test
npx playwright install
```

Prefer testing a few critical journeys over creating a large brittle suite.

For accessibility automation on Playwright projects, add `@axe-core/playwright` and keep at least one representative route test. Accessibility automation is a guard, not a complete substitute for keyboard/manual review.

## Code health after AI-driven churn

Vibe coding tends to leave stale exports, files, and dependencies after repeated rewrites. For JavaScript/TypeScript projects, Knip is the recommended optional cleanup layer.

Use it after substantial feature churn or before a release, not necessarily on every keystroke. Review findings before deleting anything because dynamic imports, framework entry points, generated files, and runtime conventions can look unused to static analysis.

The optional starter is `templates/optional/knip.jsonc`.

## Local Git quality guard

Lefthook is an optional local guard for repositories with stable commands. Keep hooks fast: changed-file formatting/linting or another small check is appropriate; a full production build on every commit usually is not.

Hooks supplement final verification and CI. They do not replace either. The starter is `templates/optional/lefthook.yml.example`.

The kit repository itself keeps a working guard at `lefthook.yml`: its pre-commit job runs `node scripts/validate-kit.mjs` and `node scripts/verify-bootstrap-protocol.mjs` whenever staged files touch the kit contract (manifest, docs, scripts, skills, templates, or Markdown), so kit changes verify themselves. Enable it per clone with `npx lefthook install`. If Lefthook is not installed, run the two scripts manually before committing kit changes.

## Suggested verification ladder

```text
focused test
→ lint/typecheck
→ full tests
→ Knip when code-health cleanup is relevant
→ production build
→ critical Playwright/browser journeys
→ axe accessibility checks when configured
→ visual QA against the real route
```

Do not claim UI behavior is verified from `next build` alone.

## Optional CI

Solo experiments do not require remote CI. Shared, production, or frequently deployed projects should consider a lightweight CI gate that runs the repository's own scripts on push or pull request.

The optional template in `templates/optional/github-actions-ci.yml` intentionally avoids deployment and secrets. Copy and adapt it only when the project needs remote verification.

Recommended CI scope:

- dependency install from lockfile
- lint
- typecheck
- tests
- production build

Add Playwright only when the execution environment and test dependencies are intentionally configured.

## Production observability

A production project should deliberately choose an observability strategy rather than assume deployment success means runtime health.

Use Sentry, OpenTelemetry, or an existing project-standard equivalent when production visibility is needed. The minimum useful signals are:

- unhandled server/client errors
- failed background jobs or webhooks
- important API latency/failure rate
- release/deployment identity
- enough request context to debug without recording secrets or unnecessary personal data

Do not add both Sentry and a full OpenTelemetry stack by default. Prefer the smallest system that satisfies the operational requirement.

## Production readiness rule

Never label a project "production-ready" only because this kit or a specific stack was installed. The claim requires project-specific evidence across security, data handling, tests, browser behavior, monitoring, backups/recovery where relevant, and operational ownership.
