# Changelog

## 1.1.0 — 2026-10-08

### Added

- A dependency-free Node 22+ CLI: init, update, inspect, status, doctor, sources, help, version, and verify.
- SHA-256 ownership records, full dry-run plans, safe updates, install locks, atomic metadata, and rollback of installer-written files.
- Optional native skills directories for Claude, Codex, Copilot, and Gemini, with reusable local CLI helpers.
- Explicit selection of optional Playwright, accessibility, Knip, Lefthook, and CI starter files.
- A dated primary-source registry and attribution notes for Spec Kit, Superpowers, Repomix, and RTK.
- Lifecycle and security regressions using temporary projects and actual CLI subprocesses.

### Fixed

- Missing policy no longer removes built-in rules in the command runner; malformed policy prevents execution.
- Local policy cannot erase built-in deny and approval rules; explicit approval requires an authorization reason.
- Audit destinations reject traversal and symlink paths. Common Git global options are normalized before classification.
- Memory validates secrets in owner/status as well as text; metrics validate secret-shaped fields and nonnegative numeric counters.
- Invalid JSON state/manifests are reported instead of silently treated as unconfigured projects.
- Drift reports include changed fields and a blocked detector returns a failing exit code.
- Windows and Bash bootstrap delegate to the same installer.

### Compatibility and scope

- Existing architecture, lockfiles, and user-owned files are preserved. Legacy installations can use init to add missing files, but untracked existing files require manual merge.
- No npm packages, cloud services, secrets, deployments, or remote source execution are required for the kit itself.
- Verification is local; macOS/Linux execution and end-to-end model productivity measurements are not claimed.

### Verification

`node scripts/verify-kit.mjs`: PASS on Windows with Node 24.19.0. All five groups passed: syntax, manifest/docs, bootstrap protocol, contract evals, and 25/25 regression tests (zero skipped). The tests include the actual PowerShell wrapper, installed doctor, Unicode/spaced project paths, idempotent resumes, a simulated upstream template upgrade, local customization conflicts, and security-negative cases. `git diff --check` also passed.
