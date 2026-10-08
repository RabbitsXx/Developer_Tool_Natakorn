---
name: automation
description: Build and maintain dependable scripts, command-line tools, and repeatable automation with explicit inputs, safe side effects, and verifiable outcomes.
---

# Automation work

Inspect the existing language, invocation conventions, and output format before designing a new interface. Keep the tool dependency-light and make side effects explicit.

## Working rules

- Define input, output, failure behavior, and rerun behavior before implementation.
- Validate arguments and input data at the boundary; give actionable errors without dumping sensitive content.
- Make repeatable operations idempotent where practical, and keep dry-run support for risky writes.
- Prefer deterministic behavior, stable output, and explicit exit codes.
- Add focused checks for empty input, malformed input, Unicode, duplicates, and reruns when relevant.
- Report only commands and cases that were actually run.

## References

- [CLI contracts](references/cli-contracts.md)
- [Safe file operations](references/safe-file-operations.md)
- [Automation verification](references/verification.md)
