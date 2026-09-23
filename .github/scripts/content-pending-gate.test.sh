#!/usr/bin/env bash
# content-pending-gate.sh 회귀 테스트 — 임시 git 저장소에 커밋을 만들어 판정만 본다(리포 파일은 건드리지 않는다).
# 사용: bash .github/scripts/content-pending-gate.test.sh
set -uo pipefail

GATE="$(cd "$(dirname "$0")" && pwd)/content-pending-gate.sh"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
pass=0
fail=0

g() { git -C "$TMP" -c user.name=gate-test -c user.email=gate-test@example.invalid "$@" >/dev/null 2>&1; }
commit() { g add -A && g commit -q --allow-empty -m "$1"; }
put() { mkdir -p "$(dirname "$TMP/$1")" && printf '%s\n' "$2" >"$TMP/$1"; }
expect() { # 기대 exit · 설명 · [rev]
  local want="$1" name="$2"
  CONTENT_GATE_ROOT="$TMP" bash "$GATE" ${3:+"$3"} >/dev/null 2>&1
  local got=$?
  if [[ $got -eq $want ]]; then pass=$((pass + 1)); else fail=$((fail + 1)); echo "FAIL: $name (want $want, got $got)"; fi
}

g init -q
expect 2 "커밋 없음 → 검사 불가"

put README.md 'x'
commit "no client"
expect 2 "apps/client/app 없음 → 검사 불가"

put apps/client/app/content/pending.ts "export const P9_4_PENDING = 'P9_4_PENDING' as const"
put apps/client/app/content/pending.test.ts "expect(P9_4_PENDING)"
put apps/client/CLAUDE.md '`P9_4_PENDING` 규칙 설명'
put apps/client/app/content/business.ts "export const X = '확정'"
commit "clean"
CLEAN="$(git -C "$TMP" rev-parse HEAD)"
expect 0 "정의 파일 · 테스트 · 문서에만 있음 → 통과"
expect 2 "없는 리비전 → 검사 불가" deadbeef

put apps/client/app/content/business.ts "export const X = P9_4_PENDING"
commit "pending in content"
PENDING="$(git -C "$TMP" rev-parse HEAD)"
expect 1 "콘텐츠 파일에 있음 → 막힘"
expect 0 "리비전 인자 — 깨끗한 커밋" "$CLEAN"

# 워크트리에서만 지우고 커밋 안 함 → HEAD 는 여전히 막힘
put apps/client/app/content/business.ts "export const X = '확정'"
expect 1 "미커밋 수정은 통과가 아니다(HEAD 기준)"
g checkout -q -- apps/client/app/content/business.ts

# 반대로 커밋은 깨끗하고 워크트리에만 자리표시자 → HEAD 통과
g checkout -q "$CLEAN"
put apps/client/app/content/business.ts "export const X = P9_4_PENDING"
expect 0 "미커밋 자리표시자는 HEAD 판정에 안 들어간다"
g checkout -q -- apps/client/app/content/business.ts

for path in apps/client/nuxt.config.ts apps/client/app/content/data.json apps/client/server/utils/x.js apps/client/shared/y.mts apps/client/app/pages/z.vue; do
  g checkout -q "$CLEAN"
  put "$path" "P9_4_PENDING"
  commit "pending in $path"
  expect 1 "$path 에 있음 → 막힘"
done

g checkout -q "$PENDING"
expect 1 "detached HEAD 도 같은 판정"

CONTENT_GATE_ROOT="$TMP" bash "$GATE" "" >/dev/null 2>&1
got=$?
if [[ $got -eq 2 ]]; then pass=$((pass + 1)); else fail=$((fail + 1)); echo "FAIL: 빈 리비전 인자 → 검사 불가 (want 2, got $got)"; fi

# 바이너리 속성이 붙어도 텍스트로 본다(.gitattributes -diff)
g checkout -q "$CLEAN"
put .gitattributes 'apps/client/app/content/*.ts -diff'
put apps/client/app/content/business.ts "export const X = P9_4_PENDING"
commit "binary attr"
expect 1 "-diff 속성 파일도 막힘"

# pending.ts 는 정해진 이름만 — 별칭 · 재수출로 비껴가지 않게
for alias in "export const TBD = P9_4_PENDING" "export { P9_4_PENDING as TBD }" "export default P9_4_PENDING" "export const displayValue\$ = P9_4_PENDING" "export  const TBD = 1"; do
  g checkout -q "$CLEAN"
  put apps/client/app/content/pending.ts "export const P9_4_PENDING = 'P9_4_PENDING' as const
$alias"
  put apps/client/app/content/business.ts "export const X = TBD"
  commit "alias: $alias"
  expect 1 "pending.ts 별칭 막힘 — $alias"
done

# 쉼표 선언으로 허용 줄에 별칭을 붙이면 그 줄이 목록과 달라진다
g checkout -q "$CLEAN"
put apps/client/app/content/pending.ts "export const P9_4_PENDING = 'P9_4_PENDING' as const, TBD = P9_4_PENDING"
put apps/client/app/content/business.ts "export const X = TBD"
commit "comma alias"
expect 1 "쉼표 선언 별칭 막힘"

# 글자 P9_4_PENDING 없이 표시 문구로 채우는 우회
for value in "export const X = PENDING_LABEL" "export const X = '(확정 전)'" 'export const X = "(확정 전)"'; do
  g checkout -q "$CLEAN"
  put apps/client/app/content/business.ts "$value"
  commit "label: $value"
  expect 1 "표시 문구 우회 막힘 — $value"
done
# 주석의 «(확정 전)» 은 세지 않는다
g checkout -q "$CLEAN"
put apps/client/app/content/business.ts "/** 확정 전 값은 «(확정 전)» */
export const X = '확정'"
commit "comment only"
expect 0 "주석의 «(확정 전)» 은 통과"

# 여러 인자 → 검사 불가(한 ref 만 보고 통과하지 않게)
CONTENT_GATE_ROOT="$TMP" bash "$GATE" "$CLEAN" "$PENDING" >/dev/null 2>&1
got=$?
if [[ $got -eq 2 ]]; then pass=$((pass + 1)); else fail=$((fail + 1)); echo "FAIL: 여러 인자 → 검사 불가 (want 2, got $got)"; fi

# 임시 파일을 못 만들면 통과가 아니라 검사 불가
g checkout -q "$PENDING"
NOTMP="$(mktemp -d)"
printf '#!/bin/sh\nexit 1\n' >"$NOTMP/mktemp"
chmod +x "$NOTMP/mktemp"
PATH="$NOTMP:$PATH" CONTENT_GATE_ROOT="$TMP" bash "$GATE" >/dev/null 2>&1
got=$?
rm -rf "$NOTMP"
if [[ $got -eq 2 ]]; then pass=$((pass + 1)); else fail=$((fail + 1)); echo "FAIL: mktemp 실패 → 검사 불가 (want 2, got $got)"; fi

# 객체를 못 읽으면(손상 · 누락) «없음» 이 아니라 검사 불가
g checkout -q "$CLEAN"
blob="$(git -C "$TMP" rev-parse "$CLEAN:apps/client/app/content/business.ts")"
rm -f "$TMP/.git/objects/${blob:0:2}/${blob:2}"
expect 2 "blob 누락 → 검사 불가 (통과 아님)" "$CLEAN"

echo "content-pending-gate: $pass pass · $fail fail"
[[ $fail -eq 0 ]]
