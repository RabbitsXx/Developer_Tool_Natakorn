#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: bash scripts/bootstrap-project.sh /path/to/project" >&2
  exit 2
fi

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
kit_root="$(cd "$script_dir/.." && pwd)"
target="$1"

if [[ ! -d "$target" ]]; then
  echo "Target directory does not exist: $target" >&2
  exit 1
fi

target="$(cd "$target" && pwd)"
echo "Bootstrapping AI project files into: $target"

copy_if_missing() {
  local source_name="$1"
  local destination_name="$2"
  local destination="$target/$destination_name"

  if [[ -e "$destination" ]]; then
    echo "[SKIP] $destination_name already exists; merge it manually."
    return
  fi

  mkdir -p "$(dirname "$destination")"
  cp "$kit_root/templates/$source_name" "$destination"
  echo "[ADD]  $destination_name"
}

copy_kit_file_if_missing() {
  local source_name="$1"
  local destination_name="$2"
  local destination="$target/$destination_name"

  if [[ -e "$destination" ]]; then
    echo "[SKIP] $destination_name already exists; preserve project-local skill changes."
    return
  fi

  mkdir -p "$(dirname "$destination")"
  cp "$kit_root/$source_name" "$destination"
  echo "[ADD]  $destination_name"
}

copy_if_missing ../START_PROMPT.md START_PROMPT.md
copy_if_missing AGENTS.md AGENTS.md
copy_if_missing .gitignore .gitignore
copy_if_missing .editorconfig .editorconfig
copy_if_missing PROJECT_CONTEXT.md PROJECT_CONTEXT.md
copy_if_missing run.md docs/run.md
copy_if_missing env.example .env.example
copy_if_missing repomix.config.json repomix.config.json
copy_if_missing repomixignore .repomixignore

copy_kit_file_if_missing skills/ui-ux/README.md .ai-kit/skills/ui-ux/README.md
copy_kit_file_if_missing skills/ui-ux/01-ux-architect.md .ai-kit/skills/ui-ux/01-ux-architect.md
copy_kit_file_if_missing skills/ui-ux/02-design-system.md .ai-kit/skills/ui-ux/02-design-system.md
copy_kit_file_if_missing skills/ui-ux/03-production-ui-builder.md .ai-kit/skills/ui-ux/03-production-ui-builder.md
copy_kit_file_if_missing skills/ui-ux/04-responsive-mobile.md .ai-kit/skills/ui-ux/04-responsive-mobile.md
copy_kit_file_if_missing skills/ui-ux/05-visual-qa.md .ai-kit/skills/ui-ux/05-visual-qa.md

node "$kit_root/scripts/setup-project.mjs" --target "$target"
echo 'Done. Paste START_PROMPT.md into the AI agent, then let it continue from .ai-kit/project.json.'
echo 'UI/UX skills installed as instructions only under .ai-kit/skills/ui-ux; load them only for relevant UI work.'
echo 'Optional starters (not auto-installed): Playwright, axe accessibility, Knip, Lefthook, and GitHub Actions templates under templates/optional/'
