# Prompt Enchant workflow

## Purpose

Choose whether to rewrite a prompt, silently prepare to execute a request, or ask one focused question.

## Workflow

1. **Classify the request.** Is the user asking for a reusable prompt, or asking you to perform the work? Preserve that distinction through the response.
2. **Find the real context.** For repository work, confirm project instructions and inspect the smallest relevant owner files, callers, examples, and checks. For prompt-only work without a target repo, use only facts supplied by the user. Mark unknown facts rather than inventing them.
3. **Write an internal brief.** Capture the intended result, scope, important constraints/non-goals, observable acceptance, and the narrowest useful verification. Include user, flow, device, and accessibility requirements only when they affect the task.
4. **Run the completeness gate.** Ask: could two reasonable agents implement materially different behavior from this request? Can each important requirement be checked? Are safety/permission boundaries clear? If repository evidence resolves the gap, use it. If the gap is material and evidence cannot resolve it, ask one concise question. Otherwise choose a reversible assumption.
5. **Match the workflow to the task.** Do a clear small task directly. For uncertain or cross-layer work, explore and outline a short plan before editing. For a reproducible bug, include the symptom and reproduction; for UI, define the user flow and real visual checks; for APIs/data, include relevant error, authorization, integrity, and rollback checks.
6. **Produce only the needed prompt structure.** Use the task patterns in [03](03-task-prompt-patterns.md) and the checklist in [04](04-enforcement-checklist.md). Remove sections that do not change implementation or verification.
7. **Continue when execution was requested.** Do not stop after generating an improved prompt. Implement, verify, and report exact evidence. When only a prompt was requested, return the copy-ready prompt and do not execute it.

## Codex and Claude fit

- For **Codex**, identify desired behavior, relevant paths or reproduction evidence, constraints, and verification. Let Codex search the repo when paths are unknown. Use plan mode when exploration or multiple milestones matter, not as a ritual.
- For **Claude Code**, cite known files, symptoms, examples, and test preferences. Let it explore first and plan before uncertain multi-file work; have it run a visible check and report the command/result.
- Keep the core prompt portable. Mention a model-specific mode or tool only when the user is actually using that capability.

## Anti-patterns

- Do not ask the user to paste information already present in the repository.
- Do not turn the user's actual implementation request into a prompt-writing exercise.
- Do not require the user to approve an internal brief when there is no material product or risk decision.
- Do not impose “think step by step,” unrestricted autonomy, all-tools use, or long role/persona text as a substitute for context and checks.

## Output

For prompt-only work: deliver the final prompt first, then at most a short assumptions note. For execution work: retain the brief internally, perform the requested work, and report checks that truly ran.
