# 05 — Mobile release

## Purpose

Make mobile builds, signing, staged rollout, and store submission reproducible and reversible.

## Rules

1. Separate debug, internal, beta, and production variants with explicit configuration and signing ownership.
2. Verify bundle identity, version, permissions, migrations, crash reporting, deep links, and rollback/update behavior.
3. Use staged rollout or an equivalent guard when the platform supports it, with a named monitor and stop condition.
4. Never place signing keys or store credentials in the repository or logs.

## Anti-patterns

Avoid:

- calling a local debug install a release verification;
- changing production signing or store configuration without explicit authorization;
- shipping a migration that old and new app versions cannot tolerate.

## Output

Record variant, build artifact, device evidence, signing/config checks, rollout, and follow-ups.
