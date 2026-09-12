---
name: security
description: Apply practical application security controls: threat modeling, authentication and authorization boundaries, input and output safety, secrets handling, dependency risk, and security verification. Use when a task changes identity, permissions, untrusted input, sensitive data, dependencies, or security posture. Do not use as a substitute for a qualified security review of regulated or high-risk systems.
compatibility: Instruction-only; no packages installed. Uses the project's existing auth, runtime, dependency scanner, and deployment controls.
metadata:
  version: "1"
  source: ultimate-vibecoder-ecosystem
  spec: agentskills.io/specification
---

# Security

Treat security as a property of boundaries and evidence, not as a checklist added after implementation.

## Invariants

1. Untrusted input is validated at the boundary and encoded at the sink.
2. Authorization is checked server-side for the specific resource and action.
3. Secrets, personal data, and security-sensitive logs stay out of source, fixtures, and telemetry.
4. A security claim names the threat, control, and verification evidence.

## Load only what the task needs

| Task | Read |
|---|---|
| Threat model or new trust boundary | [01-threat-modeling](references/01-threat-modeling.md) |
| Auth, roles, tenant or resource access | [02-identity-and-authorization](references/02-identity-and-authorization.md) |
| User input, files, URLs, output, or webhooks | [03-input-and-output-safety](references/03-input-and-output-safety.md) |
| Secrets, dependencies, or supply chain | [04-secrets-and-supply-chain](references/04-secrets-and-supply-chain.md) |
| Security regression or release evidence | [05-security-verification](references/05-security-verification.md) |

## Completion rule

Do not call security work complete because a scanner is clean. Record the changed trust boundary, the abuse case considered, the control added, and a verification result including a negative case where practical.
