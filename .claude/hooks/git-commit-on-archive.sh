#!/usr/bin/env bash

input="$(cat)"
cmd="$(printf '%s' "$input" | jq -r '.tool_input.command // empty' 2>/dev/null)"

if ! printf '%s' "$cmd" | grep -Eq 'openspec[^&|;]*archive|opsx:archive'; then
  exit 0
fi

name="$(printf '%s' "$cmd" | grep -oE 'changes/archive/[A-Za-z0-9_.-]+' | sed 's#.*/##' | tail -1)"
if [ -z "$name" ]; then
  name="$(printf '%s' "$cmd" | grep -oE 'archive[[:space:]]+[A-Za-z0-9_-]+' | awk '{print $2}' | head -1)"
fi
name="${name:-unknown}"

repo_dir="${CLAUDE_PROJECT_DIR:-$(pwd)}"
cd "$repo_dir" || exit 0

git add openspec/ >/dev/null 2>&1

if git diff --cached --quiet -- openspec/ 2>/dev/null; then
  exit 0
fi

git commit -m "openspec: archive change ${name}" -- openspec/ >/dev/null 2>&1
exit 0
