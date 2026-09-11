---
name: release
description: Plan and execute a production release safely: preflight verification of environment, migrations, and config; deliberate deploy execution with real health evidence; rollback readiness decided before deploying; release-window observability; and post-release confirmation on real traffic. Use when a task deploys, promotes a build, changes release configuration, prepares a rollback plan, or verifies a release in production. Do not use for everyday feature work that has not reached a release decision.
compatibility: Instruction-only; no packages installed. Deployment targets, commands, and observability come from the project's own selected stack. Never deploys production, rotates secrets, or mutates cloud resources without explicit user authorization.
metadata:
  version: "1"
  source: ultimate-vibecoder-ecosystem
  spec: agentskills.io/specification
---

# Release

A release is the moment the team bets accumulated work against real users. The bet is only rational when the escape route exists before the traffic arrives.

## Invariants that hold in every task

1. Never deploy production, change cloud configuration, or rotate secrets without the user explicitly naming the target and authorizing it.
2. Decide the rollback trigger and its owner before deploying, not after the first error page.
3. Migrations and deploy follow the kit's ordering rule: deploy code that tolerates the new schema first, migrate, then deploy code that relies on it.
4. Deploy with the project's own pipeline and commands; never invent a one-off path around it.
5. Health is observed on real traffic — checks, logs, errors, and user-visible behavior — never inferred from a successful pipeline run.
6. The work is not shipped until post-release verification has been performed or explicitly handed over with a name attached.

## Load only what the task needs

This skill is deliberately split. Read this file, then open only the reference files the task maps to.

| Task | Read in order |
|---|---|
| Preparing a release | [01](references/01-preflight.md) → [02](references/02-deploy.md) → [03](references/03-rollback.md) |
| Executing or observing a deploy | [02](references/02-deploy.md) → [04](references/04-release-observability.md) |
| Something is wrong during or after release | [03](references/03-rollback.md) → [04](references/04-release-observability.md) |
| Confirming a release is healthy, or closing it out | [04](references/04-release-observability.md) → [05](references/05-post-release.md) |
| Designing a release process for a new project | [01](references/01-preflight.md) → [03](references/03-rollback.md) → [05](references/05-post-release.md) |

- 01 proves the release is ready before anything moves.
- 02 executes the deploy as a deliberate, observable operation.
- 03 makes going back a rehearsed step instead of an improvisation.
- 04 watches the release window with signals that matter to users.
- 05 converts the release into evidence and follow-ups.

## Completion rule

A release is not "done" when the pipeline turns green. Report what was deployed (commit, environment, migration state), the health evidence observed after the change went live, the rollback plan and its readiness status, and any follow-up item with an owner. If production deployment was not authorized in this session, say so explicitly and stop at the preflight stage — do not treat preparation as release.
