---
name: mobile
description: Build and verify mobile applications with attention to platform conventions, navigation, offline and sync states, native permissions, performance, release builds, and device or simulator evidence. Use for mobile UI, platform integration, mobile data flow, or app-store release work. Do not use for browser-only UI or backend-only changes.
compatibility: Instruction-only; no packages installed. Preserve the project's selected mobile framework, native tooling, and platform targets.
metadata:
  version: "1"
  source: ultimate-vibecoder-ecosystem
  spec: agentskills.io/specification
---

# Mobile

Mobile correctness includes platform behavior, lifecycle interruptions, poor networks, and a real device or simulator—not just a successful bundle.

## Invariants

1. Preserve the selected mobile framework and native project structure.
2. Design loading, offline, retry, background, permission, and interrupted-navigation states explicitly.
3. Request the minimum platform permissions at the moment they are needed.
4. Verify critical flows on the target platform(s) and record device/build evidence.

## Load only what the task needs

| Task | Read |
|---|---|
| Navigation, state, and platform architecture | [01-mobile-architecture](references/01-mobile-architecture.md) |
| Offline, sync, and lifecycle interruptions | [02-offline-and-sync](references/02-offline-and-sync.md) |
| Native permissions and platform APIs | [03-permissions-and-platform](references/03-permissions-and-platform.md) |
| Performance, accessibility, and device QA | [04-device-quality](references/04-device-quality.md) |
| Build, signing, and store release | [05-mobile-release](references/05-mobile-release.md) |

## Completion rule

Do not call mobile work complete from a simulator-free unit test or a successful compile alone. Record platform, build variant, device/simulator, critical flow, and observed result.
