# 01 — Mobile architecture

## Purpose

Keep navigation, state ownership, platform boundaries, and data flow understandable under lifecycle changes.

## Rules

1. Preserve the selected framework and separate screen state, domain state, and server/cache state.
2. Define behavior for cold start, background/foreground, process death, deep links, and interrupted navigation.
3. Keep platform-specific code behind narrow adapters with testable contracts.

## Anti-patterns

Avoid:

- storing server truth only in a screen component;
- assuming a process remains alive between two user actions;
- duplicating platform behavior in unrelated screens.

## Output

Record navigation/state decisions and lifecycle cases verified.
