# Evidence-based principles for coding prompts

Reviewed 2026-10-08. This reference separates current vendor operating guidance from empirical findings. Neither vendor guidance nor the cited studies prove that this skill will reduce repair time on every codebase.

## Codex guidance

OpenAI's [Codex prompting guide](https://developers.openai.com/codex/prompting) says useful coding prompts name the desired behavior, point to relevant code or reproduction steps, preserve constraints, and say how to verify the change. It recommends planning for multi-step work when investigation matters; local tools can discover files, call sites, and test commands. Ask for the smallest relevant tests and actual command results.

## Claude guidance

Anthropic's [Claude Code best practices](https://code.claude.com/docs/en/best-practices) recommends specific context: files, symptoms, reproductions, existing patterns, and testing preferences. For uncertain or multi-file work, separate exploration, planning, implementation, and verification; for a one-line or otherwise clear change, planning adds overhead. It also recommends giving the agent a check that returns readable pass/fail evidence and managing irrelevant context.

Anthropic's [prompting best practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices) favors clear, direct instructions, explicit output constraints, and useful context. Examples can improve format consistency when examples closely match the task; this does not mean examples or XML structure are needed in every prompt.

## Empirical evidence

- Paiva, Canedo, and Rocha Filho (2026), [From issue titles to requirements](https://doi.org/10.1007/s00766-026-00462-z), evaluated 150 short feature requests from five OSS repositories with two models and three prompt styles (900 generated requirements). Quality was scored for unambiguity, verifiability, and singularity, with a small human validation sample. Few-shot prompting consistently improved singularity in that setup; expert-identity prompting produced model-dependent trade-offs and often hurt singularity. The authors publish the dataset and scripts on [Zenodo](https://doi.org/10.5281/zenodo.15003691). This is evidence for requirements drafting, not a direct test of repository coding agents or rework time.
- Madaan et al. (NeurIPS 2023), [Self-Refine](https://papers.neurips.cc/paper_files/paper/2023/hash/91edff07232fb1b55a505a9e9f6c0ff3-Abstract-Conference.html), evaluated iterative feedback/refinement across seven diverse tasks and reported higher human preference and task metrics than one-pass generation in its tested settings. This supports checking and improving outputs when there is a concrete criterion; it does not mean every request needs extra self-critique rounds, nor does it establish code-agent gains.

## Rules adopted here

1. Make the requested behavior and one primary outcome explicit; split distinct outcomes into separately verifiable cases.
2. Ground project facts in files, patterns, reproduction steps, or supplied sources. Ask an agent to inspect relevant files when that is more reliable than asking the user to restate repository context.
3. Convert adjectives such as “better” or “polished” into observable outcomes only when the user or task context supports them; do not invent product requirements.
4. Give the agent a real verification signal. A human-readable checklist is useful for visual or judgment-heavy outcomes, but must not be presented as a test that actually ran.
5. Do not force expert personas or few-shot examples into every prompt. Use them only when they improve a specific output distinction, then judge the result on the target model and task.
6. Keep plan depth proportional to uncertainty and scope. The task brief should reduce ambiguity without becoming a second project specification.
