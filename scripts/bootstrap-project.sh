#!/usr/bin/env bash
set -euo pipefail
if [[ $# -lt 1 ]]; then
  echo 'Usage: bash scripts/bootstrap-project.sh /path/to/project [--overlay /path/to/overlays] [--dry-run]' >&2
  exit 2
fi
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
target="$1"
shift
overlay=''
dry_run=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    --overlay)
      [[ $# -ge 2 ]] || { echo '--overlay requires a path' >&2; exit 2; }
      overlay="$2"
      shift 2
      ;;
    --dry-run) dry_run=(--dry-run); shift ;;
    *) echo "Unknown option: $1" >&2; exit 2 ;;
  esac
done
if [[ -n "$overlay" ]]; then
  node "$script_dir/sync-overlays.mjs" --source "$overlay" --target "$target" --dry-run
fi
node "$script_dir/../bin/natakorn.mjs" init --target "$target" --agent all "${dry_run[@]}"
if [[ -n "$overlay" && ${#dry_run[@]} -eq 0 ]]; then
  node "$script_dir/sync-overlays.mjs" --source "$overlay" --target "$target"
  node "$script_dir/setup-project.mjs" --target "$target"
fi
