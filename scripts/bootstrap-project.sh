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

copy_if_missing AGENTS.md AGENTS.md
copy_if_missing .gitignore .gitignore
copy_if_missing .editorconfig .editorconfig
copy_if_missing PROJECT_CONTEXT.md PROJECT_CONTEXT.md
copy_if_missing run.md docs/run.md
copy_if_missing env.example .env.example
copy_if_missing repomix.config.json repomix.config.json
copy_if_missing repomixignore .repomixignore

echo 'Done. Edit PROJECT_CONTEXT.md, command placeholders, and .env.example before asking an AI agent to build.'
