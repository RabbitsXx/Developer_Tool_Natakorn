# Audit of the original ecosystem specification

Status labels: **Fixed** means this repository now documents or enforces the safer behavior. **Measure** means the claim depends on real workload data.

| Finding | Risk | Resolution |
|---|---|---|
| `cargo install rtk` can install a different crate with the same name | Wrong executable; `rtk gain` fails | **Fixed:** use the official Git URL or checksummed release binary; verify with `rtk gain` |
| OrbStack was presented as a general workstation container runtime | OrbStack is a macOS option; the original list breaks on Windows | **Fixed:** OS-specific alternatives are documented |
| “60–90% token saving” was written as a guaranteed ecosystem outcome | RTK publishes benchmark savings, but project-wide savings vary by commands, prompts, and agent behavior | **Measure:** use `rtk gain` and compare actual sessions |
| shadcn/ui was described as eliminating CSS work | shadcn/ui provides editable source components; teams still own styling, accessibility, dependencies, and Tailwind/CSS | **Fixed:** described as a component foundation, not automatic design quality |
| Every project was expected to use the full stack | Extra services increase cost, attack surface, maintenance, and context | **Fixed:** tools are selected by product need and tiered in `toolchain.json` |
| `drizzle/schema.ts` was the only database source of truth | A TypeScript schema does not fully represent Supabase RLS, policies, grants, triggers, functions, and extensions | **Fixed:** deployable SQL migrations plus Drizzle application schema |
| Vercel Cron and Inngest were grouped without a boundary | Duplicate scheduling or unnecessary complexity | **Fixed:** decision table and single-trigger rule |
| Repomix output was treated as safe context | Packed output can contain sensitive code or data despite security scanning | **Fixed:** ignore rules, local review, and generated output excluded from Git |
| Crawl4AI and Jina Reader were listed as equivalent readers | Different operating cost and security models | **Fixed:** Jina for simple public reading; Crawl4AI for controlled advanced crawling |
| Global installation was used as the default | Global version drift makes builds hard to reproduce | **Fixed:** app dependencies stay project-local and pinned by lockfile |
| “Production-ready” was implied by tool selection | Production readiness requires project-specific security, tests, monitoring, backups, accessibility, and operational review | **Fixed:** definition of done requires evidence; the stack alone is not certification |
| Commit after every agent action | Produces noisy or broken history | **Fixed:** commit coherent, verified units; checkpoint before risky work when useful |
| Supabase + Drizzle behaved like a universal default | Encourages unnecessary rewrites and makes the kit less portable to Neon/direct PostgreSQL or existing stacks | **Fixed:** database provider and access layer are independent project decisions; existing architecture wins |
| UI verification depended on build/manual checks only | Compilation cannot prove forms, sessions, navigation, or browser behavior | **Fixed:** Playwright is a recommended project-local capability for critical user-facing journeys |
| Agent retrieval had no explicit context budget | Agents can waste tokens by reading broad directories or rereading unchanged files | **Fixed:** search-first workflow plus 5-file/15-file initial context budgets and Repomix escalation rule |
| Production monitoring was not represented as a capability | Local PASS can hide runtime failures after deployment | **Fixed:** Sentry/OpenTelemetry/project-standard observability is documented as optional production capability |
| Skill packs were kit-local Markdown that only this kit's own agent knew to load | High-quality guidance could not be reused in Claude Code, Codex, Cursor, or any other harness, and loading depended on the agent remembering to read a README | **Fixed:** each pack ships as `SKILL.md` + `references/` in the open Agent Skills format, is validated field-by-field by `validate-kit.mjs`, and is synchronized from `toolchain.json` by `scripts/sync-skills.mjs` |
| Destructive/irreversible commands were prevented only by prose instructions | Instructions are advisory; a model can still run a destructive Git, database, cloud, or container command | **Fixed (bounded):** `templates/policy.json` + `scripts/policy-check.mjs` classify every routed command as allow, approval-required, or deny, are deny-first, redact secrets, and append an audit event. `scripts/run-safe.mjs` executes only allow/approved commands. Documented explicitly as a command gate and audit trail, not an OS sandbox |
| Agent sessions ended with no durable, non-secret continuity | Every new session had to re-derive decisions, lessons, and next steps from code, wasting context and risking contradictions | **Fixed:** `.ai-kit/memory/` with append-only `decisions.jsonl` and `lessons.jsonl` plus a current `handoff.md`, written via `scripts/memory.mjs`, which rejects secret-shaped text |
| Kit effectiveness was untestable and improvements were guesses | Without task-level evidence, kit changes could not be shown to help or to regress | **Fixed (scoped):** `scripts/metrics.mjs` records session/task evidence and `scripts/eval-kit.mjs` runs deterministic contract evals. Both are documented as measuring kit contracts, not model quality |
| Skill packs covered only web/API/data/release workflows | Mobile, security, and infrastructure work fell back to generic prompting with no shared invariants | **Fixed:** `security`, `infrastructure`, and `mobile` packs ship in the same SKILL.md format, registered through the manifest with new `infrastructure` and `mobile` recommendation tags detected by the state detector |
| New AI sessions had no universal bootstrap entrypoint or persistent setup state | A new model could reinstall tools, force a preferred stack, or not know how to handle an existing project | **Fixed:** `START_PROMPT.md` + `NEW/EXISTING/RESUME` detector + commit-safe `.ai-kit/project.json` architecture fingerprint |

## Instruction surface and context cost

The kit's always-read instruction files are the largest fixed context cost a session pays, and they grew ~11% while the safety/continuity capabilities were added. That is the "instruction tax" effect: more prose raises cost in every session, while only rules traceable to a real failure reliably improve outcomes.

Two decisions follow from measuring it:

- **The skill-pack roster lives only in the manifest.** `START_PROMPT.md`, `AGENTS.md`, `SETUP.md`, and `templates/AGENTS.md` describe how to *resolve* packs (`.ai-kit/skills/`, `toolchain.json` → `skills.packs`, `.ai-kit/project.json` → `capabilities.potentiallyUseful`) and keep only the boundaries a description match would get wrong. The roster had already drifted once: adding a pack required editing four prose lists plus the manifest. `validate-kit.mjs` now fails if a concrete `.ai-kit/skills/<id>/SKILL.md` path reappears in those files.
- **Measured, not assumed.** Removing the roster was expected to save ~550 tokens; it actually *added* tokens at first, because the resolution rules were written as prose. It was then rewritten tighter, and the result is that all four files are now smaller than before the change (8,041 → 7,764 tokens combined, -277). The remaining increase over the previous release (+714 across those files) is the cost of the new policy, memory, metrics, and eval guidance — a separate trade-off that should be revisited rather than hidden.

The numbers come from `wc -c` on the committed files (tokens ≈ bytes / 4) and are reproducible; they are estimates, not measured model tokenizer counts.

## Current Windows workstation result

Latest doctor verification for this checkout:

- Available: Git, Node.js, npm, pnpm, Python, RTK binary, Bruno CLI, GitHub CLI.
- RTK is currently found through the user-local fallback path but is not invokable as plain `rtk` from the project shell; add its directory to PATH for normal AI/terminal use.
- Missing optional tools: Docker-compatible runtime, Yarn, Bun.
- Yarn/Bun are not required because npm/pnpm are already available.
- A container runtime is required only when the selected project needs local containerized services.
- Python 3.14 is installed; verify Crawl4AI dependency compatibility before creating its environment.

Use `scripts/doctor.ps1` to refresh this result on any machine.

## GitHub Actions decision

GitHub Actions is intentionally **not enabled by default** in this private kit. Local validation remains the baseline through `scripts/doctor.ps1`, `scripts/doctor.sh`, bootstrap verification, JSON parsing, and project checks.

An optional starter workflow now exists at `templates/optional/github-actions-ci.yml`. Copy it into a target project's `.github/workflows/` only when remote verification is useful and after confirming that project's package manager, Actions policy, runner/billing settings, and required services. The template performs verification only; it does not deploy.

## Primary references

- [RTK installation](https://www.rtk-ai.app/docs/getting-started/installation/)
- [Repomix getting started and security](https://repomix.com/guide/)
- [Supabase local development](https://supabase.com/docs/guides/local-development)
- [Bruno installation](https://docs.usebruno.com/get-started/bruno-basics/download)
- [Crawl4AI installation](https://docs.crawl4ai.com/basic/installation/)
- [Jina Reader](https://jina.ai/reader/)
- [Inngest Next.js quick start](https://www.inngest.com/docs/getting-started/nextjs-quick-start)
- [Vercel Cron troubleshooting](https://examples.vercel.com/kb/guide/troubleshooting-vercel-cron-jobs)
