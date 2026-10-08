# Prompt completeness and enforcement checklist

Use this as a quick gate, not as a form the user must fill out.

## Before implementation

- [ ] The intended user outcome is concrete, not only an implementation adjective.
- [ ] Scope and important constraints are based on the user's request and repository evidence.
- [ ] Acceptance statements describe observable behavior and do not combine unrelated outcomes.
- [ ] The planned check can distinguish pass from fail; known commands or routes are preferred over invented test infrastructure.
- [ ] Relevant empty, failure, boundary, authorization, rollback, visual, or device cases are included only when the task can reach them.
- [ ] High-impact unknowns are resolved; low-impact assumptions are reversible and disclosed.
- [ ] Tool and skill choices remove uncertainty or verify outcomes; nothing is selected just to increase tool count.

## Before returning an enchanted prompt

- [ ] It preserves the user's intent and asks for the actual intended deliverable.
- [ ] It includes repository facts only when verified, otherwise it tells the target agent where to inspect.
- [ ] It has one primary outcome and the shortest set of constraints/acceptance cases that makes it testable.
- [ ] It names a verification signal and does not ask for proof the agent cannot produce.
- [ ] It avoids redundant roles, generic quality adjectives, speculative features, unrelated best practices, and mandatory steps that add no value.
- [ ] It is copy-ready, in the user's language, with assumptions or unresolved questions clearly separated.

## Anti-patterns

- A longer prompt is not automatically a better prompt.
- “Use all tools,” “be an expert,” and “make it perfect” are not acceptance criteria.
- A plan, generated test, or self-review statement is not evidence that the result works.
- Never promise zero corrections or claim this workflow saves time without measurements.

## After implementation

Compare the result with each acceptance case. Run the narrowest relevant check and inspect its actual output. If a case fails, fix that case and rerun the check. If the user corrects the same issue again, capture that exact learning in an instruction, example, or regression check when it has broader value; do not respond by making every future prompt longer.
