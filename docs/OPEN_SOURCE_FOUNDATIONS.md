# Open-source foundations

Reviewed on 2026-10-08. `sources.json` is the machine-readable research record; `node bin/natakorn.mjs sources` reads it offline. These are primary-source design references. This release contains original implementations of the adopted patterns, with no copied upstream source or skill prose.

The Gemini directory convention was also checked against the official [Gemini CLI skill tutorial](https://geminicli.com/docs/cli/tutorials/skills-getting-started/). The Spec Kit integration documentation supplies the other native directory conventions used by the installer.

| Source | Evidence reviewed | Pattern used here | What the evidence establishes |
|---|---|---|---|
| [GitHub Spec Kit](https://github.com/github/spec-kit), MIT | [Integration lifecycle](https://github.github.com/spec-kit/reference/integrations.html) | SHA-256 ownership records, preserve customized files, agent-specific skills directories | A documented installation lifecycle; no kit productivity benchmark |
| [Superpowers](https://github.com/obra/superpowers), MIT | [Verification skill](https://github.com/obra/superpowers/tree/main/skills/verification-before-completion) | Executed evidence before completion, scoped verification | A published development workflow; not independent model-quality evidence |
| [Repomix](https://github.com/yamadashy/repomix), MIT | [Security guide](https://repomix.com/guide/security) | Ignore sensitive context and review packed output | Documented packing and scanning controls; no guarantee against all secret disclosure |
| [RTK](https://github.com/rtk-ai/rtk), Apache-2.0 | Official repository and `gain` interface | Small terminal output and measured local savings | An operational measurement interface; upstream percentages are not this kit's result |
| [v0 by Vercel](https://github.com/v0-by-Vercel), proprietary product | [Official prompting guide](https://vercel.com/blog/how-to-prompt-v0) and [text prompting docs](https://api2.v0.dev/docs/text-prompting) | Specify product surface, context of use, and constraints; adapted here into a task brief with acceptance and verification | Public usage guidance is available, but v0's product/system implementation is not open source; reported iteration savings are vendor examples |
| [Promptfoo](https://github.com/promptfoo/promptfoo), MIT | [Getting started](https://www.promptfoo.dev/docs/getting-started/) | Use representative cases and assertions to evaluate outputs | An open-source evaluation framework; this kit adopts the test-case pattern without installing it or claiming measured agent-quality gains |
| OpenAI Codex | [Prompting guide](https://developers.openai.com/codex/prompting) | State desired behavior, relevant code/reproduction, constraints, and verification; plan multi-step work when useful | Official operating guidance, not a measured productivity guarantee for this kit |
| Anthropic Claude Code | [Best practices](https://code.claude.com/docs/en/best-practices) | Give specific file/context and a readable check; explore and plan when uncertainty warrants, skip plan overhead for clear small changes | Official workflow guidance, not a controlled prompt comparison |
| Anthropic Claude | [Prompting best practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices) | Use direct instructions, relevant context, and output constraints; add examples only when they clarify expected output | General prompting guidance whose effects depend on task and model |
| Paiva et al. (2026), open-access requirements study | [From issue titles to requirements](https://doi.org/10.1007/s00766-026-00462-z) | Keep requirements singular and verifiable; avoid defaulting to expert personas or examples | 150 OSS issue titles, two models, three prompt styles (900 outputs); few-shot improved singularity in the tested setup, while expert-identity prompting had model-dependent trade-offs. It did not measure coding-agent repair time |
| Madaan et al. (NeurIPS 2023) | [Self-Refine](https://papers.neurips.cc/paper_files/paper/2023/hash/91edff07232fb1b55a505a9e9f6c0ff3-Abstract-Conference.html) | Refine output against explicit feedback and criteria when a check finds a gap | Reports improvements across seven diverse tasks; not a direct coding-agent result and not a reason to add repeated critique to every task |

Vercel also publishes the separate [`v0` TypeScript API SDK](https://github.com/vercel/v0-sdk) under Apache-2.0. It wraps the API; it is not the source code for the v0 product or its underlying generation system.

## Selection criteria

Use a maintained implementation with primary documentation, a clear license, an observable behavior, and a pattern that fixes a concrete issue here. Stars and marketing percentages are not acceptance evidence. Findings remain dated snapshots: no remote code is fetched or executed when installing the kit.

## Concrete improvements

- A single Node CLI owns both Windows and Bash bootstrap behavior.
- A dry run validates source and destination paths and reports the complete file plan without creating `.ai-kit`.
- Installed files are recorded with SHA-256 hashes. Existing files are preserved without claiming ownership, including files identical to a kit template.
- An update changes only tracked files that still match their installed hash. A local edit blocks the whole plan before any file changes.
- The installer uses exclusive creation, a process lock, atomic metadata writes, and rollback of files written if execution fails. Empty directories may remain after rollback.
- Helpers are installed locally with their manifest, so inspect, status, doctor, policy, memory, and metrics work without a second checkout.
- A missing policy uses built-in rules. Malformed policy, invalid regex, symlinked audit paths, or traversal stops the runner before execution.
- The start instructions turn one-shot intent into a compact brief with repository constraints, observable acceptance cases, and a verification path; recurring corrections should become durable project rules or regression checks.
- The `prompt-enchant` skill applies a silent completeness gate to nontrivial work and only expands a prompt when the user asks or missing scope/acceptance creates a real risk. Its evidence summary distinguishes vendor guidance from task-limited empirical studies.

## Evidence boundaries

Regression checks exercise real temporary projects and the actual CLI, including Unicode paths, repeats, upgrades, customizations, malformed configuration, authorization failures, and traversal. They establish those software contracts. They do not measure agent intelligence, production application readiness, reduced rework from `prompt-enchant`, or a guaranteed token reduction. The requirements study measures linguistic quality of generated requirements, and Self-Refine covers diverse non-coding-specific tasks; neither is evidence that this skill improves every vibe-coding task. See the dated release entry in `CHANGELOG.md` for the environment actually verified.

The command policy is a conservative regex gate, not a shell parser or operating-system sandbox. Unknown executables, aliases, obfuscated commands, and arbitrary scripts can escape semantic classification. A host permission layer remains necessary. File operations assume the project is not being modified by a hostile process during path validation.
