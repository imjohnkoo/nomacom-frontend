#!/bin/bash
# Compare vendored nuxt-skills against upstream onmax/nuxt-skills.
# Outputs a diff summary so the maintainer can decide whether to bump.
#
# Usage:
#   .claude/scripts/sync-nuxt-skills.sh          # diff against latest main
#   .claude/scripts/sync-nuxt-skills.sh <ref>    # diff against specific commit/tag
#
# Does NOT auto-update. Manual review required (supply chain safety).

set -euo pipefail

UPSTREAM_REPO="https://github.com/onmax/nuxt-skills.git"
TARGET_REF="${1:-main}"
VENDORED_SKILLS=("vue" "nuxt" "vite" "vitest" "vueuse" "ts-library")

REPO_ROOT="$(git rev-parse --show-toplevel)"
SKILLS_DIR="$REPO_ROOT/.claude/skills"
TMP_DIR="$(mktemp -d -t nuxt-skills-sync-XXXXXX)"
trap "rm -rf $TMP_DIR" EXIT

echo "==> Cloning $UPSTREAM_REPO @ $TARGET_REF"
git clone --depth 1 --branch "$TARGET_REF" "$UPSTREAM_REPO" "$TMP_DIR/upstream" 2>&1 | tail -2 || {
  # branch flag may fail on commit SHAs; retry full clone + checkout
  rm -rf "$TMP_DIR/upstream"
  git clone "$UPSTREAM_REPO" "$TMP_DIR/upstream" 2>&1 | tail -2
  ( cd "$TMP_DIR/upstream" && git checkout "$TARGET_REF" )
}

UPSTREAM_SHA=$(cd "$TMP_DIR/upstream" && git rev-parse --short HEAD)
echo "==> Upstream SHA: $UPSTREAM_SHA"
echo ""

# Extract vendored SHA from any vendored skill's frontmatter
VENDORED_SHA=$(grep -hE "(source|vendored_from): onmax/nuxt-skills@" "$SKILLS_DIR/vue/SKILL.md" | head -1 | sed -E 's/.*@([a-f0-9]+).*/\1/')
echo "==> Currently vendored SHA: $VENDORED_SHA"
echo "==> Target upstream SHA:    $UPSTREAM_SHA"
echo ""

if [ "$VENDORED_SHA" = "$UPSTREAM_SHA" ]; then
  echo "✓ Vendored copy is already at upstream HEAD. Nothing to do."
  exit 0
fi

CHANGED=0
for skill in "${VENDORED_SKILLS[@]}"; do
  echo "==> Diff for $skill"
  if ! diff -rq "$SKILLS_DIR/$skill" "$TMP_DIR/upstream/skills/$skill" 2>/dev/null \
       | grep -v "vendored_at\|vendored_from" > "$TMP_DIR/$skill.diff" || [ -s "$TMP_DIR/$skill.diff" ]; then
    if [ -s "$TMP_DIR/$skill.diff" ]; then
      cat "$TMP_DIR/$skill.diff" | head -20
      CHANGED=$((CHANGED+1))
    else
      echo "  (no changes)"
    fi
  else
    echo "  (no changes)"
  fi
  echo ""
done

echo "==================================================="
echo "Skills with changes: $CHANGED / ${#VENDORED_SKILLS[@]}"
echo ""
if [ $CHANGED -gt 0 ]; then
  echo "To preview a specific skill's diff in detail:"
  echo "  diff -ru .claude/skills/<skill> <upstream-clone>/skills/<skill>"
  echo ""
  echo "If changes look benign, re-vendor manually:"
  echo "  1. Re-run the original vendoring (cp -r upstream/skills/<name> .claude/skills/)"
  echo "  2. Re-add the source/vendored_at frontmatter lines"
  echo "  3. Bump 'vendored_at' to today's date and 'source' to @$UPSTREAM_SHA"
  echo ""
  echo "DO NOT auto-merge upstream changes — review every change."
fi
