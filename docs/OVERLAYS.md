# Project overlays

Overlays keep organization- and domain-specific rules outside the reusable kit core. Create a source folder per overlay with an `OVERLAY.md` containing frontmatter fields `name`, `description`, `appliesTo`, and `owner`, followed by rules, sources of truth, and golden cases. The `name` must match its folder name.

Install overlays during bootstrap with `--overlay <dir>` (PowerShell: `-OverlayPath <dir>`) or set `AI_KIT_OVERLAY_DIR`. You can also run `node scripts/sync-overlays.mjs --source <dir> --target <project> [--dry-run]`. Existing destinations are preserved. Secret-like files (`.env*`, `*.pem`, `*.key`), symbolic links, and files above the per-file size limit are refused.

Agents should read matching `OVERLAY.md` files and use them only within their declared scope. Overlay rules may add domain requirements, but they must never relax security, command policy, or verification requirements. Current repository evidence and higher-priority safety rules remain authoritative.

The generic starter is `templates/overlay/OVERLAY.md`. Copy it to a project-owned overlay directory and replace the example scope and owner before use. Do not put organization-specific rules in the kit's core templates or skills.
