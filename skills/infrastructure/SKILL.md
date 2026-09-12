---
name: infrastructure
description: Plan and change infrastructure safely: CI/CD, containers, cloud configuration, networking, reliability, least privilege, rollback, and operational verification. Use when a task changes deployment infrastructure, pipelines, runtime environments, cloud resources, or operational controls. Do not use for application feature code unless infrastructure behavior is the actual change.
compatibility: Instruction-only; no cloud credentials or packages installed. Commands and providers come from the project.
metadata:
  version: "1"
  source: ultimate-vibecoder-ecosystem
  spec: agentskills.io/specification
---

# Infrastructure

Infrastructure is production code: make changes explicit, reversible, least-privileged, and observable.

## Invariants

1. Identify the exact environment and blast radius before changing it.
2. Keep secrets out of configuration, plans, logs, and artifacts.
3. Prefer additive and reversible changes with a tested rollback path.
4. A successful pipeline is not proof of runtime health.

## Load only what the task needs

| Task | Read |
|---|---|
| Architecture, environment, or blast radius | [01-environment-and-blast-radius](references/01-environment-and-blast-radius.md) |
| CI/CD pipeline or release automation | [02-ci-cd](references/02-ci-cd.md) |
| Container or runtime image | [03-containers-and-runtime](references/03-containers-and-runtime.md) |
| Cloud/network/access configuration | [04-cloud-and-least-privilege](references/04-cloud-and-least-privilege.md) |
| Reliability, rollback, and operations | [05-operational-verification](references/05-operational-verification.md) |

## Completion rule

Report the named environment, change plan, permissions used, verification evidence, rollback path, and remaining operational risk. Never claim a cloud change is complete from a local plan alone.
