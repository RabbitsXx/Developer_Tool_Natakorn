---
name: ui-ux
description: Design and build user-facing interfaces with an explicit UX flow, a consistent design system, production-quality implementation, intentional responsive and mobile behavior, and browser-based visual plus accessibility QA. Use when a task touches a page, screen, form, navigation, component system, design tokens, layout, responsive or mobile behavior, loading/empty/error states, or the visual quality of anything a user sees. Do not use for backend, database, infrastructure, or documentation-only work.
compatibility: Instruction-only; no packages installed. Visual QA steps need a running app and a browser. Playwright and @axe-core/playwright are optional project-local tools, used only when the project already selected them.
metadata:
  version: "2"
  source: ultimate-vibecoder-ecosystem
  spec: agentskills.io/specification
---

# UI/UX

Complex backend, simple frontend. Design for the actual user, not for the developer who understands the architecture.

A user should quickly understand:

1. Where am I?
2. What matters here?
3. What should I do next?
4. What will happen when I act?

## Load only what the task needs

This skill is deliberately split. Read this file, then open only the reference files the task maps to. Do not load every reference for a trivial styling change.

| Task | Read in order |
|---|---|
| New page, product flow, or redesign | [01](references/01-ux-architect.md) → [02](references/02-design-system.md) → [03](references/03-production-ui-builder.md) → [04](references/04-responsive-mobile.md) → [05](references/05-visual-qa.md) |
| Existing page UX fix | [01](references/01-ux-architect.md) → [03](references/03-production-ui-builder.md) → [04](references/04-responsive-mobile.md) → [05](references/05-visual-qa.md) |
| Design-system or component work | [02](references/02-design-system.md) → [03](references/03-production-ui-builder.md) → [05](references/05-visual-qa.md) |
| Mobile or responsive bug | [04](references/04-responsive-mobile.md) → [05](references/05-visual-qa.md) |
| Small visual fix | [03](references/03-production-ui-builder.md) → [05](references/05-visual-qa.md) |

- 01 turns a request into a user flow before any UI code is written.
- 02 keeps screens visually coherent instead of inventing a new UI language per route.
- 03 implements UI that is understandable, maintainable, accessible, and grounded in real data.
- 04 makes small-screen behavior intentional rather than a shrunken desktop layout.
- 05 closes the gap between "code compiles" and "the interface actually works".

## Required workflow for substantial UI work

Requirement → user goal → task flow → information architecture → wireframe/hierarchy → design system → implementation → responsive verification → browser/visual/accessibility QA.

Before implementing, establish the user goal, the task flow, the information hierarchy, and the design-system constraints. Reuse the project's existing design system and components before adding another UI library.

## Completion rule

Do not call a UI change complete because it compiles, and do not call it complete because lint, typecheck, and build passed. Browser behavior and visual quality need their own evidence: the changed route inspected in a real browser at desktop, intermediate, and mobile widths, plus the primary interaction exercised. Use Playwright and `@axe-core/playwright` for repeatable checks when the project has selected them.

Report the exact route, viewports, and journey that were verified, and name any state left intentionally unverified.
