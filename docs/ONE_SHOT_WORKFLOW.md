# One-shot task shaping

One-shot work means making the first implementation attempt complete enough to meet an explicit set of acceptance cases. It is a workflow for reducing avoidable clarification and repair cycles, not a promise that changes will never need correction.

## Reusable task brief

Adapt the fields to the task; do not force irrelevant fields into every request.

```text
Outcome: [who needs what result, in which situation, and why]
Change: [concrete behavior/surface to implement]
Constraints: [existing architecture, contracts, design system, data/security rules]
In scope: [required behaviors and relevant states]
Out of scope: [nearby work that should not change]
Acceptance:
- Given [starting condition], when [action], then [observable result]
- Given [important edge/failure condition], when [action], then [safe result]
Verification: [existing check, real route/command, and any manual observation]
Assumptions: [reversible project-consistent defaults for unresolved low-impact details]
```

### Adapt the brief by work type

- **UI:** name the information shown, actions available, user flow, visual hierarchy/tone, target device, responsive behavior, and empty/loading/error states that matter.
- **API:** name the caller, request and response shape, success and failure outcomes, authorization boundary, and real request checks.
- **Data:** name the current provider/access layer, constraints, migration and rollback behavior, and how the changed data behavior will be checked.
- **Bug:** record the observed behavior, expected behavior, reproducible input/route, and the regression case that distinguishes the fix.
- **Automation or CLI:** specify representative input, output, invalid/edge input, repeatability, and the exact command used to verify it.

## First-pass completeness check

Before changing files, inspect the smallest relevant code slice and ask:

1. Did I identify the real owner and callers from repository evidence?
2. Are user-visible behavior and applicable boundary/failure states explicit?
3. Do the constraints preserve the existing stack, interfaces, user changes, and safety rules?
4. Is each acceptance case observable, and is there an existing way to verify it?
5. Are unresolved assumptions reversible, or does one materially change product behavior, architecture, security, data handling, or destructive scope?

Keep the brief separate from the artifact's user-facing content. Acceptance cases and implementation constraints guide the build; display them only when end users need that information. For a short landing page, lead with one audience, one benefit, and one primary action, and keep process explanations out unless they are part of the product's actual value proposition.

Ask the user only for a material decision that cannot be resolved from evidence. Otherwise choose and state a reversible default, implement the requested scope end to end, and verify the acceptance cases. On a failure, fix the unmet case at its source and rerun its check; avoid speculative cleanup or broad redesign.

When a similar correction happens repeatedly, encode the lesson once in the project's rule, example, or regression check so the next task starts with it.

## Research basis

Vercel's public v0 guidance organizes a strong UI prompt around product surface, use context, and constraints/taste. This kit adapts those inputs to repository-level coding work by adding existing-code evidence, acceptance cases, and verification. Vercel reports fewer follow-up prompts in its own examples; that is vendor-reported evidence and does not establish a guaranteed improvement for this kit.

Promptfoo is an open-source prompt and agent evaluation framework. Its test cases and assertions support the general practice of defining representative inputs and observable pass/fail conditions. This kit adopts that evaluation pattern conceptually and does not require or install Promptfoo.

## Prompt example

```text
Outcome: Support agents triage urgent tickets during a shift handoff.
Change: Update the existing ticket list to show urgency, age, and current owner, with filtering by status.
Constraints: Reuse the current table and design tokens; preserve the current API and permissions.
In scope: Search, status filters, empty results, loading, and request failure feedback.
Out of scope: Changing ticket assignment rules or persistence.
Acceptance:
- Given open tickets, when I filter by urgent, then only urgent tickets remain and each shows age and owner.
- Given no matches, when the filter is active, then an empty state explains how to clear it.
- Given the list request fails, then the page shows a retry path and does not show stale results as current.
Verification: Run the existing focused UI checks and inspect the real ticket route at desktop and mobile widths.
Assumptions: Preserve existing sort order when filters change.
```
