#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
kit_root="$(cd "$script_dir/.." && pwd)"
target=""
overlay_source="${AI_KIT_OVERLAY_DIR:-}"
while [[ $# -gt 0 ]]; do
  case "$1" in
    --overlay)
      [[ $# -ge 2 ]] || { echo "--overlay requires a directory" >&2; exit 2; }
      overlay_source="$2"
      shift 2
      ;;
    -* )
      echo "Unknown option: $1" >&2
      exit 2
      ;;
    * )
      [[ -z "$target" ]] || { echo "Only one target directory is allowed" >&2; exit 2; }
      target="$1"
      shift
      ;;
  esac
done

if [[ -z "$target" ]]; then
  echo "Usage: bash scripts/bootstrap-project.sh /path/to/project [--overlay /path/to/overlays]" >&2
  exit 2
fi

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

copy_if_missing ../START_PROMPT.md START_PROMPT.md
copy_if_missing AGENTS.md AGENTS.md
copy_if_missing .gitignore .gitignore
copy_if_missing .editorconfig .editorconfig
copy_if_missing PROJECT_CONTEXT.md PROJECT_CONTEXT.md
copy_if_missing run.md docs/run.md
copy_if_missing env.example .env.example
copy_if_missing repomix.config.json repomix.config.json
copy_if_missing repomixignore .repomixignore
copy_if_missing policy.json .ai-kit/policy.json
copy_if_missing memory/README.md .ai-kit/memory/README.md
copy_if_missing agent-pointers/CLAUDE.md CLAUDE.md
copy_if_missing agent-pointers/GEMINI.md GEMINI.md
copy_if_missing agent-pointers/.github/copilot-instructions.md .github/copilot-instructions.md

node "$kit_root/scripts/sync-skills.mjs" --target "$target"
node "$kit_root/scripts/sync-runtime.mjs" --target "$target"

if [[ -n "$overlay_source" ]]; then
  node "$kit_root/scripts/sync-overlays.mjs" --source "$overlay_source" --target "$target"
fi

node "$kit_root/scripts/setup-project.mjs" --target "$target"
echo 'Done. Paste START_PROMPT.md into the AI agent, then let it continue from .ai-kit/project.json.'
echo 'Agent Skills installed as instructions only under .ai-kit/skills/ (SKILL.md + references per pack); load only the pack that matches the task.'
echo 'Optional starters (not auto-installed): Playwright, axe accessibility, Knip, Lefthook, and GitHub Actions templates under templates/optional/'
