#!/usr/bin/env bash
set -u

strict=0
if [[ "${1:-}" == "--strict" ]]; then
  strict=1
fi

missing_required=0
missing_recommended=0

check_tool() {
  local name="$1"
  local tier="$2"
  local command_name="$3"

  if command -v "$command_name" >/dev/null 2>&1; then
    local version
    version="$($command_name --version 2>/dev/null | head -n 1)"
    printf '[OK]   %-12s %s\n' "$name" "${version:-installed}"
  else
    printf '[--]   %-12s missing (%s)\n' "$name" "$tier"
    if [[ "$tier" == "required" ]]; then
      missing_required=$((missing_required + 1))
    elif [[ "$tier" == "recommended" ]]; then
      missing_recommended=$((missing_recommended + 1))
    fi
  fi
}

echo 'Ultimate VibeCoder Ecosystem - workstation doctor'
printf 'OS: %s %s\n\n' "$(uname -s)" "$(uname -m)"

check_tool git required git
check_tool node required node
check_tool npm optional npm
check_tool pnpm optional pnpm
check_tool yarn optional yarn
check_tool bun optional bun
check_tool rtk recommended rtk
check_tool python optional python3
check_tool docker optional docker
check_tool 'Bruno CLI' optional bru
check_tool 'GitHub CLI' optional gh

if command -v node >/dev/null 2>&1; then
  node_major="$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null)"
  if [[ "$node_major" =~ ^[0-9]+$ ]] && (( node_major < 22 )); then
    echo '[WARN] Node.js 22+ is recommended for the current Repomix CLI.'
    missing_required=$((missing_required + 1))
  fi
fi

printf '\nSummary: %s required issue(s), %s recommended issue(s).\n' "$missing_required" "$missing_recommended"
echo 'This doctor is read-only and does not install or modify tools.'
echo 'See docs/INSTALLATION.md for OS-specific setup and optional-tool guidance.'

if (( missing_required > 0 )) || (( strict == 1 && missing_recommended > 0 )); then
  exit 1
fi
