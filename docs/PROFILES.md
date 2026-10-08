# Project profiles

The kit detects a primary work profile from project evidence and stores it in `.ai-kit/project.json` as `project.profile.primary`. It also records every matched profile with its `definitionOfDone`, so the active checklist reflects relevant work without maintaining a second checklist in instructions.

Agents should read the detected profile from `.ai-kit/project.json` and use each matched profile's `definitionOfDone` as the task's verification checklist. A profile is an orientation aid, not authority over current source files or user requirements. When evidence is ambiguous, inspect the project and report the uncertainty.

The profile catalog and summaries live only in `toolchain.json`. Use `node scripts/profile-info.mjs` to print the current catalog, or `node scripts/profile-info.mjs --target <project>` to include a detected profile. Do not duplicate the catalog in prose; this keeps documentation from drifting as profiles change.

The `web-app` profile covers the previous browser-focused verification ladder. Other profiles tailor checks to APIs, scripts, data, documents, mobile applications, or infrastructure. `general` is the fallback when no specific profile matches.
