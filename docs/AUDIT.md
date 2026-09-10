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

## Current Windows workstation result

At the time this kit was created:

- Available: Git, Node.js, npm, pnpm, Python, RTK.
- Missing or not on PATH: Docker-compatible runtime, Bruno CLI/Desktop command, Yarn.
- Yarn is not required because pnpm/npm are already available.
- A container runtime is required only for local Supabase or other containerized services.
- Python 3.14 is installed; verify Crawl4AI dependency compatibility before creating its environment.

Use `scripts/doctor.ps1` to refresh this result on any machine.

## GitHub Actions status on this private repository

The repository accepts pushes and recognizes both workflow files, but GitHub-hosted jobs currently finish with `startup_failure` before creating any job. A manual smoke workflow containing only `echo` fails the same way.

Evidence gathered:

- Repository Actions are enabled and `allowed_actions` is `all`.
- GitHub recognizes `Validate kit` and accepts `workflow_dispatch`.
- Action tags referenced by the workflow exist.
- GitHub Status reports Actions operational at the time of the test.
- The full validation workflow passes its equivalent checks locally.

This isolates the remaining issue to account-level runner eligibility, billing/usage restriction, or another GitHub account control rather than repository code.

Resolution procedure:

1. Open GitHub account **Settings → Billing and licensing → Actions** and resolve any payment, spending-limit, or usage restriction shown there.
2. Keep repository **Settings → Actions → General** enabled; it is already configured to allow all actions.
3. Run the minimal diagnostic again: `gh workflow run runner-smoke.yml --repo RabbitsXx/Developer_Tool_Natakorn --ref main`.
4. Confirm it passes with `gh run list --repo RabbitsXx/Developer_Tool_Natakorn --limit 3`.
5. Then run the full suite: `gh workflow run validate.yml --repo RabbitsXx/Developer_Tool_Natakorn --ref main`.

The `runner-smoke.yml` workflow is manual-only and can be removed after the account-level issue is resolved.

## Primary references

- [RTK installation](https://www.rtk-ai.app/docs/getting-started/installation/)
- [Repomix getting started and security](https://repomix.com/guide/)
- [Supabase local development](https://supabase.com/docs/guides/local-development)
- [Bruno installation](https://docs.usebruno.com/get-started/bruno-basics/download)
- [Crawl4AI installation](https://docs.crawl4ai.com/basic/installation/)
- [Jina Reader](https://jina.ai/reader/)
- [Inngest Next.js quick start](https://www.inngest.com/docs/getting-started/nextjs-quick-start)
- [Vercel Cron troubleshooting](https://examples.vercel.com/kb/guide/troubleshooting-vercel-cron-jobs)
