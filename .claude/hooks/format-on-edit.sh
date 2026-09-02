#!/usr/bin/env bash
# Auto-format files after Edit/Write. Non-blocking — never fails the tool call.
set +e

input=$(cat)
file=$(echo "$input" | jq -r '.tool_input.file_path // empty' 2>/dev/null)

[[ -z "$file" || ! -f "$file" ]] && exit 0

case "$file" in
  *.ts|*.tsx|*.js|*.jsx|*.vue|*.json|*.md|*.yml|*.yaml|*.css)
    npx --no-install prettier --write "$file" >/dev/null 2>&1 || true
    ;;
esac

exit 0
