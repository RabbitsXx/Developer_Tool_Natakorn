# Automation verification

- Run the tool twice on the same fixture to check deterministic or idempotent behavior.
- Include empty, one-row, malformed, duplicate, and Unicode fixtures when applicable.
- Verify both the produced artifact and the reported exit status.
- Keep test fixtures separate from user data and clean temporary files only inside a known test directory.
- Summarize covered cases and explicitly name any untested platform or environment.
