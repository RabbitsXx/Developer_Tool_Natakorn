# Open-source foundations

Reviewed on 2026-10-08. `sources.json` is the machine-readable research record; `node bin/natakorn.mjs sources` reads it offline. These are primary-source design references. This release contains original implementations of the adopted patterns, with no copied upstream source or skill prose.

The Gemini directory convention was also checked against the official [Gemini CLI skill tutorial](https://geminicli.com/docs/cli/tutorials/skills-getting-started/). The Spec Kit integration documentation supplies the other native directory conventions used by the installer.

| Source | Evidence reviewed | Pattern used here | What the evidence establishes |
|---|---|---|---|
| [GitHub Spec Kit](https://github.com/github/spec-kit), MIT | [Integration lifecycle](https://github.github.com/spec-kit/reference/integrations.html) | SHA-256 ownership records, preserve customized files, agent-specific skills directories | A documented installation lifecycle; no kit productivity benchmark |
| [Superpowers](https://github.com/obra/superpowers), MIT | [Verification skill](https://github.com/obra/superpowers/tree/main/skills/verification-before-completion) | Executed evidence before completion, scoped verification | A published development workflow; not independent model-quality evidence |
| [Repomix](https://github.com/yamadashy/repomix), MIT | [Security guide](https://repomix.com/guide/security) | Ignore sensitive context and review packed output | Documented packing and scanning controls; no guarantee against all secret disclosure |
| [RTK](https://github.com/rtk-ai/rtk), Apache-2.0 | Official repository and `gain` interface | Small terminal output and measured local savings | An operational measurement interface; upstream percentages are not this kit's result |

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

## Evidence boundaries

Regression checks exercise real temporary projects and the actual CLI, including Unicode paths, repeats, upgrades, customizations, malformed configuration, authorization failures, and traversal. They establish those software contracts. They do not measure agent intelligence, production application readiness, or a guaranteed token reduction. See the dated release entry in `CHANGELOG.md` for the environment actually verified.

The command policy is a conservative regex gate, not a shell parser or operating-system sandbox. Unknown executables, aliases, obfuscated commands, and arbitrary scripts can escape semantic classification. A host permission layer remains necessary. File operations assume the project is not being modified by a hostile process during path validation.
