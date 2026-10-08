---
name: prompt-enchant
description: Use when a user explicitly asks to enchant, improve, or rewrite a prompt, or when missing scope or acceptance has caused repeated rework. For clear small tasks, use only a silent completeness check and proceed; do not add prompt overhead.
compatibility: Instruction-only; no packages installed.
metadata:
  version: "1"
  source: ultimate-vibecoder-ecosystem
  spec: agentskills.io/specification
---

# Prompt Enchant

Turn user intent into concise instructions that a coding agent can act on and verify. Ground missing context in the repository; never make a prompt longer just to make it look thorough.

## Invariants that hold in every task

1. Keep the user's requested outcome, language, scope, and authority intact. Do not convert a request to perform work into a prompt-only answer.
2. For every nontrivial coding task, silently check that outcome, scope/constraints, observable acceptance, and relevant verification are clear before implementation. Use this skill when the check fails or the user asks for prompt help. For a clear atomic task, proceed without a prompt rewrite.
3. Inspect the smallest relevant repository slice before adding project-specific facts. Treat current files and instructions as stronger evidence than guesses or model memory.
4. Ask only when a missing decision materially changes product behavior, architecture, security, data handling, or a destructive action. Resolve low-impact gaps with a reversible assumption and state it.
5. Select only relevant tools and skills. Do not add a role/persona, examples, tool list, or process step unless it changes the result.
6. No prompt can guarantee a one-shot result. Verify implementation against concrete acceptance cases and report evidence and skipped checks honestly.

## Choose the right mode

- **Prompt-only request** (for example “enchant this prompt”): return a copy-ready prompt in the user's language. Do not execute it or edit files unless asked. Separate verified context from assumptions or open questions.
- **Work request with an incomplete prompt:** use the skill as an internal gate, fill facts from repository evidence, resolve only material ambiguities with the user, and continue with the requested work.
- **Clear, small request:** apply the silent completeness check and act directly; do not expose a planning ceremony or make the user approve a rewritten prompt.
- **Repeated correction or missed requirement:** include the concrete lesson as an explicit constraint or acceptance case, then continue from the current state. Do not expand the task beyond that correction.

## Load only what the task needs

| Need | Read |
|---|---|
| Evidence behind the shared Codex/Claude guidance | [01 — Evidence-based principles](references/01-evidence-based-principles.md) |
| Turn a request into a brief or decide whether to ask | [02 — Enchant workflow](references/02-enchant-workflow.md) |
| Produce a task-specific, copy-ready prompt | [03 — Task prompt patterns](references/03-task-prompt-patterns.md) |
| Check prompt completeness without overloading it | [04 — Enforcement checklist](references/04-enforcement-checklist.md) |

## Completion rule

For prompt-only work, return a prompt the user can copy, with assumptions labeled. For execution work, finish the requested task and verify it against the brief. A longer prompt, a self-rating, or a plausible-looking result is not proof that the work is correct.
