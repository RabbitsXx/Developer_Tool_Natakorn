# Task prompt patterns

Use the smallest pattern that describes the actual request. Keep the user's language and terms unless they request a translation.

## Compact prompt structure

```text
Outcome: [what should be true for the user]
Context: [verified repo/source facts or where to inspect them]
Scope: [behavior or files to change; relevant non-goals]
Constraints: [architecture, UX, compatibility, safety, or style rules that apply]
Acceptance: [observable success cases, including relevant failure/boundary cases]
Verify: [existing command, real route/request, visual check, or other evidence]
```

Do not include empty headings. For a clear one-line fix, the user's request plus a directly applicable check may be enough.

## Reproducible bug

```text
Fix [observable symptom] in [known area, or inspect the relevant flow]. Reproduce it first using [steps/input]. Preserve [behavior/API/data constraints]. Add or update a focused regression check for [case]. Run [narrow relevant check] and report the command and result.
```

If the reproduction is not known and the agent can safely inspect the code, ask it to find and report the smallest reproduction before changing files. Do not invent a root cause.

## Feature or UX change

```text
Help [user] accomplish [one primary outcome] in [context]. Inspect the existing route/components and follow their patterns. Change [scope] while preserving [constraints]. Acceptance: [visible behavior and relevant states]. Verify with [real user journey/check]; report anything not verified.
```

For browser-facing work, name the user's task flow, hierarchy, responsive behavior, and applicable accessibility constraints. Ask for a real browser/visual check when the project supports it; do not claim visual acceptance from a build alone.

## Explicit prompt-only request

Return a copy-ready prompt in this order where applicable: goal; supplied context/source anchors; scope and non-goals; must-keep constraints; observable acceptance; verification/output format. Label assumptions. Do not include claims that require the target agent to know unavailable data; direct it to inspect the target source instead.

## Examples and model-specific details

Add a small example only when output format, voice, or a tricky distinction is hard to state. Examples should come from the real task and include a boundary case when that improves clarity. Do not add generic “act as a senior expert” boilerplate. If the user names Codex or Claude, reference its plan/inspection workflow only when useful; otherwise keep the prompt portable.
