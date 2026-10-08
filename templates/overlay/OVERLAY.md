---
name: business-rules-example
description: Example overlay for project-specific business rules.
appliesTo: Projects that explicitly select this overlay.
owner: Project owner
---

# Project overlay

This file contains project-specific context. Keep organization rules in overlays outside the kit core.

## Rules

- Add only rules that are supported by an authoritative project source.
- Explain scope, exceptions, and who can resolve conflicts.
- Overlay rules may add domain requirements, but must never relax security, policy, or verification requirements.

## Source of truth

- Name the authoritative documents, systems, or owners here.
- Record how an agent should handle missing or conflicting information.

## Golden cases

Add a few representative input/output cases that show how the rules apply. Label unknowns explicitly; do not invent values.
