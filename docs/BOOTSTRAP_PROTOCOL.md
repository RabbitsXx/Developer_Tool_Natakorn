# AI Bootstrap Protocol

This protocol solves the first-run problem: a new AI agent must know how to enter a project without rebuilding, replacing, or over-configuring it.

## Three project modes

### `NEW_PROJECT`

No meaningful application/repository markers are detected yet.

The kit may install its instruction/context files, but the AI must not choose a full application stack until product requirements justify it. Ask only architecture-changing questions, then choose the smallest viable stack.

### `EXISTING_PROJECT`

Application/repository markers exist, but `.ai-kit/project.json` has not been established yet.

The AI must preserve the detected framework, package manager, database/provider, data-access layer, deployment model, test setup, and unrelated user changes. The kit adapts to the project; the project does not adapt to the kit.

### `RESUME_CONFIGURED_PROJECT`

`.ai-kit/project.json` already exists.

The AI validates the persisted architecture fingerprint against the current repository. If no drift is detected, setup should not be repeated. If drift is detected, inspect why before updating architecture decisions.

## Persistent state

The bootstrap detector writes:

```text
.ai-kit/project.json
```

The file contains only non-secret project metadata:

- kit/state schema version
- initial project mode and current setup status
- detected runtime/framework/package manager
- database provider and access layer signals
- UI/UX, API, data-layer, testing, security, infrastructure, mobile, and release skill-pack presence
- browser E2E, accessibility, code-health, Git-hook, background-work, observability, deployment, mobile, and infrastructure signals
- available and potentially useful capabilities
- primary and matched project profiles, with a `definitionOfDone` checklist for each matched profile
- file-extension hints from a bounded names-only scan; data and document contents are not opened for profile detection
- installed project overlays reported as `overlay:<name>` capabilities
- quality-gate script names
- architecture fingerprint
- drift status
- pending setup decisions

- `policy.json` is copied to `.ai-kit/policy.json` and supplies a deny-first command policy. The bootstrap copies `policy-check.mjs`, `run-safe.mjs`, `memory.mjs`, and `metrics.mjs` into `.ai-kit/bin/`; in an installed project, use `node .ai-kit/bin/policy-check.mjs`. The kit repository uses `node scripts/policy-check.mjs`.
- `.ai-kit/memory/` stores non-secret decisions, lessons, and the current handoff; `.ai-kit/metrics/` stores compact task/session evidence. Current repository evidence always wins.
- Profile and overlay results are deliberately excluded from the architecture fingerprint. The `web-app` profile carries browser-focused checks; other profiles add task-appropriate checks from their own `definitionOfDone` lists.



## Safe detector

From the kit repository:

```text
node ai-project-kit/scripts/setup-project.mjs --target .
```

Or, while inside the kit itself:

```text
node scripts/setup-project.mjs --target /path/to/project
```

The detector may create/update only `.ai-kit/project.json`. It does not install dependencies, modify application code, migrate databases, deploy, log in to cloud services, or read secret `.env` values.

Use `--dry-run` to inspect the proposed state without writing it:

```text
node scripts/setup-project.mjs --target /path/to/project --dry-run
```

If a configured project has architecture drift, the detector reports it and **does not overwrite the recorded fingerprint**. After inspecting the change and confirming it is intentional, explicitly accept the new architecture state:

```text
node scripts/setup-project.mjs --target /path/to/project --accept-drift
```

Never use `--accept-drift` simply to silence a warning.

## Bootstrap behavior

1. Add missing AI-project instruction, policy, memory, and agent-neutral pointer files without overwriting existing project files.
2. Synchronize every Agent Skills pack registered in `toolchain.json` into `.ai-kit/skills/<pack>` without overwriting project-local edits, using the manifest-driven sync script.
3. Copy the four runtime helpers into `.ai-kit/bin/`; existing copies are preserved and differences are reported unless `--update` is requested.
4. Optionally copy project-owned overlays from `--overlay <dir>` or `AI_KIT_OVERLAY_DIR`. Existing overlays are preserved; secret-like files and oversized files are refused.
5. Run the safe project detector to establish `.ai-kit/project.json`.



The bootstrap process intentionally does **not** install Playwright, `@axe-core/playwright`, Knip, Lefthook, Supabase, Neon, Drizzle, Prisma, Docker, Inngest, observability, CI, or any other optional dependency. Skills are text instructions only; package installation remains project-specific.

Before mutating Git, database, cloud, container, or remote systems in an installed project, use `.ai-kit/bin/policy-check.mjs`. A deny decision is a hard stop; approval-required decisions need explicit authorization. If authorized, execute through `.ai-kit/bin/run-safe.mjs`, which records the approval and only then starts the command. In the kit repository, use the equivalent `scripts/` paths. These scripts are a command gate and audit trail, not an OS sandbox; a harness must still enforce process permissions.


```text
node .ai-kit/bin/policy-check.mjs --target /path/to/project --command "..."
```

Use the memory and metrics commands for non-secret continuity and evidence:

```text
node scripts/memory.mjs --target /path/to/project --kind handoff --text "..."
node scripts/metrics.mjs --target /path/to/project --event session-end --session <id> --status passed
```



## AI startup order

An AI entering a configured project should use this order:

```text
START_PROMPT.md
    ↓
.ai-kit/project.json
    ↓
AGENTS.md
    ↓
PROJECT_CONTEXT.md
    ↓
docs/run.md + repository docs
    ↓
Targeted code discovery
    ↓
If a task matches a pack (ui-ux, api, data-layer, testing, security, infrastructure, mobile, release): `.ai-kit/skills/<pack>/SKILL.md` → only the references/ the task maps to
    ↓
Actual task
```

The persistent state is a fast orientation layer, not a replacement for repository evidence. If state and current code disagree, current code wins and the agent must explain the drift. The state is intentionally safe to commit: it contains no secret values and does not rewrite timestamps on every unchanged resume.

Read `project.profile` at the start of a task and follow every matched profile's `definitionOfDone` checklist. Profiles and overlays are derived context; they are not architecture authority and do not affect the architecture fingerprint.

## Architecture fingerprint

The state file contains a SHA-256 fingerprint derived only from stable detected architecture fields. It intentionally excludes clocks and secret values.

This lets a later agent distinguish:

- same setup, safe to resume
- architecture changed, inspect before proceeding

A changed fingerprint is not automatically an error. It is a signal that setup assumptions may need review. Drift is fail-closed for state updates: the previous fingerprint remains authoritative until the change is explicitly accepted.

## Setup questions policy

Ask the user only when information cannot be safely inferred and materially changes architecture or authority. Examples:

- product purpose and primary users for a blank project
- whether authentication/persistence/uploads/realtime/background jobs are actually required
- cloud credentials or login
- production deployment authority
- destructive migration or repository action

Do not ask about facts that can be detected from existing files.

## Completion rule

Bootstrap is complete when:

- instruction files exist or existing equivalents are preserved
- `.ai-kit/project.json` exists and passes schema validation
- project mode is known
- existing architecture has not been silently replaced
- pending human decisions are explicit
- the AI can continue to the user's actual task without reinstalling or rescanning the whole repository
