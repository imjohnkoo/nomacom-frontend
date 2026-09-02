#!/usr/bin/env bash
# typecheck baseline gate — 기준선에 «없던» 신규 타입 에러만 차단한다.
#
# 왜 baseline 인가:
#   기존 에러를 전부 고쳐야만 게이트를 켤 수 있다면 게이트는 영원히 안 켜진다.
#   실측(2026-09-02) 기준 admin 0건 / client 7건이었고, client 7건은 전부
#   `possibly undefined` 계열이라 런타임 분기 검토가 필요해 급히 고치면 회귀 위험이 있다.
#   → 지금 상태를 기준선으로 박고, 그 위로 늘어나는 것만 막는다.
#
# 사용:
#   .github/scripts/typecheck-gate.sh client          # 판정
#   .github/scripts/typecheck-gate.sh client --update # 기준선 갱신 (줄어들 때만)
#
# 판정 대상에서 제외하는 것:
#   - node_modules/** — 우리가 고칠 수 없고 의존성 버전에 따라 흔들린다
#     (client 는 qrcode-vue3 가 src 를 직접 export 해서 15건이 잡힌다)
set -uo pipefail

APP="${1:-}"
MODE="${2:-check}"

if [[ -z "$APP" ]]; then
  echo "usage: $0 <admin|client> [--update]" >&2
  exit 2
fi

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
APP_DIR="$ROOT/apps/$APP"
BASELINE="$ROOT/.github/typecheck-baseline/$APP.txt"

if [[ ! -d "$APP_DIR" ]]; then
  echo "⛔ 없는 앱: $APP ($APP_DIR)" >&2
  exit 2
fi

# ⚠️ prepare 는 «없을 때만» 이 아니라 **항상** 돌린다.
#    Nuxt 4 는 tsconfig 를 app/node/server/shared 4개로 쪼개고 각 파일 목록을 고정 기록한다.
#    따라서 prepare 를 건너뛰면 **새로 추가된 파일이 타입체크 대상에서 빠진다** —
#    게이트가 «신규 파일의 신규 에러» 를 통과시키는, 존재 이유를 무너뜨리는 오작동이 된다.
#    (2026-09-02 게이트 회귀 테스트가 이 결함을 잡았다. 비용은 ~1.4초.)
echo "· nuxt prepare ($APP)"
(cd "$APP_DIR" && yarn nuxt prepare >/dev/null 2>&1) || {
  echo "⛔ nuxt prepare 실패 — 타입 정보를 만들 수 없어 판정 불가" >&2
  exit 2
}

# 에러 라인을 «파일(줄,열): TS코드» 로 정규화한다.
# 메시지 본문은 TS 버전에 따라 문구가 바뀌므로 기준선에 넣지 않는다.
normalize() {
  grep -E "error TS[0-9]+" \
    | grep -v "node_modules" \
    | sed -E 's/^(.+\([0-9]+,[0-9]+\)): (error TS[0-9]+).*$/\1: \2/' \
    | sort -u
}

CURRENT="$(cd "$APP_DIR" && npx vue-tsc --noEmit -p .nuxt/tsconfig.json 2>&1 | normalize)"

if [[ "$MODE" == "--update" ]]; then
  mkdir -p "$(dirname "$BASELINE")"
  new_count=$(printf '%s' "$CURRENT" | grep -c . || true)
  if [[ ! -f "$BASELINE" ]]; then
    # 최초 생성 — 지금 상태가 곧 기준선이다
    printf '%s\n' "$CURRENT" | grep -v '^$' > "$BASELINE"
    echo "✔ baseline 최초 생성: $APP ($new_count 건)"
    exit 0
  fi
  old_count=$(grep -c . "$BASELINE" || true)
  if (( new_count > old_count )); then
    echo "⛔ 기준선이 늘어난다 ($old_count → $new_count). 에러를 고치거나, 정말 늘려야 하면 사용자 승인 후 직접 편집하라." >&2
    exit 1
  fi
  printf '%s\n' "$CURRENT" | grep -v '^$' > "$BASELINE"
  echo "✔ baseline 갱신: $APP ($old_count → $new_count)"
  exit 0
fi

if [[ ! -f "$BASELINE" ]]; then
  echo "⛔ 기준선 없음: $BASELINE — 먼저 '$0 $APP --update' 로 생성하라." >&2
  exit 2
fi

NEW="$(comm -13 <(sort -u "$BASELINE") <(printf '%s\n' "$CURRENT" | grep -v '^$' | sort -u))"
FIXED="$(comm -23 <(sort -u "$BASELINE") <(printf '%s\n' "$CURRENT" | grep -v '^$' | sort -u))"

base_n=$(grep -c . "$BASELINE" || true)
cur_n=$(printf '%s\n' "$CURRENT" | grep -c . || true)
new_n=$(printf '%s\n' "$NEW" | grep -c . || true)
fixed_n=$(printf '%s\n' "$FIXED" | grep -c . || true)

echo "typecheck-gate: $APP — baseline $base_n / current $cur_n (신규 $new_n · 해소 $fixed_n)"

if (( fixed_n > 0 )); then
  echo "· 해소된 에러 (기준선 갱신 권장 — '$0 $APP --update'):"
  printf '%s\n' "$FIXED" | sed 's/^/    /'
fi

if (( new_n > 0 )); then
  echo
  echo "⛔ 기준선에 없던 신규 타입 에러 $new_n 건:"
  printf '%s\n' "$NEW" | sed 's/^/    /'
  exit 1
fi

echo "✔ 신규 타입 에러 없음"
exit 0
