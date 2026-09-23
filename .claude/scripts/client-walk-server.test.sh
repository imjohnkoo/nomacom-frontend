#!/usr/bin/env bash
# client-walk-server.sh 회귀 테스트 — 서버를 띄우지 않는다(거부 경로 + WALK_DRY_RUN 출력만 본다).
# 사용: bash .claude/scripts/client-walk-server.test.sh
set -uo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
S="$DIR/client-walk-server.sh"
ROOT="$(cd "$DIR/../.." && pwd)"
pass=0
fail=0

ok() { pass=$((pass + 1)); }
ng() { fail=$((fail + 1)); echo "FAIL: $1"; }

expect_refuse() { # 설명 · 인자…
  local name="$1"; shift
  if WALK_DRY_RUN=1 bash "$S" "$@" >/dev/null 2>&1; then ng "$name (거부돼야 함)"; else
    [[ $? -eq 2 ]] && ok || ng "$name (exit 2 아님)"
  fi
}

# 셸에 금지 키가 있어도 새지 않아야 한다
export SPARK_API_TOKEN=leak MAYA_API_CLIENT_SECRET=leak ESIM_MANAGER_INTERNAL_SECRET=leak
export CORS_EXTRA_ORIGINS=https://evil.example DATABASE_URL=postgres://u:p@prod.example.com:5432/db

expect_refuse "모드 없음"
expect_refuse "잘못된 모드" bogus 3099
expect_refuse "포트 형식" dev abc
expect_refuse "비로컬 DB" dev 3099 'postgres://u:p@db.example.com:5432/x'
expect_refuse "로컬 다른 포트" dev 3099 'postgres://u:p@127.0.0.1:5432/x'
expect_refuse "조각으로 호스트 위장" dev 3099 'postgres://a:b@prod.example.com:5432#@127.0.0.1:55432/x'
expect_refuse "쿼리로 호스트 위장" dev 3099 'postgres://a:b@127.0.0.1:55432/x?host=prod.example.com'
expect_refuse "사용자 칸에 호스트" dev 3099 'postgres://prod.example.com:5432:b@127.0.0.1:55432/x'
expect_refuse "prod 모드 DB" prod 3099 'postgres://walk:walk@127.0.0.1:55432/walk'

out="$(WALK_DRY_RUN=1 bash "$S" dev 3099 2>&1)" || ng "dev 3099 dry-run 실패"
grep -qx 'CORS_EXTRA_ORIGINS=http://localhost:3099' <<<"$out" && ok || ng "CORS 1값"
grep -qx 'HOST=127.0.0.1' <<<"$out" && ok || ng "127.0.0.1 바인딩"
grep -qx 'NUXT_PUBLIC_GUEST_APP_ORIGIN=http://localhost:3099' <<<"$out" && ok || ng "발급 호스트"
grep -qE '^(SPARK|MAYA|ESIM_MANAGER)' <<<"$out" && ng "벤더 · 내부 키 누출" || ok
grep -q 'evil.example' <<<"$out" && ng "셸 CORS 값 누출" || ok
grep -q '^DATABASE_URL=' <<<"$out" && ng "DB 인자 없는데 DATABASE_URL" || ok

out="$(WALK_DRY_RUN=1 bash "$S" dev 3099 'postgres://walk:walk@127.0.0.1:55432/walk' 2>&1)" || ng "합성 DB dry-run 실패"
grep -qx 'DATABASE_URL=postgres://walk:walk@127.0.0.1:55432/walk' <<<"$out" && ok || ng "합성 DB 전달"

out="$(NUXT_PUBLIC_PORTONE_STORE_ID=store-x WALK_DRY_RUN=1 bash "$S" prod 3099 2>&1)" || ng "PortOne dry-run 실패"
grep -qx 'NUXT_PUBLIC_PORTONE_STORE_ID=\*\*\*' <<<"$out" && ok || ng "PortOne 공개키 통로(마스킹)"
grep -q 'NUXT_PUBLIC_PORTONE_TEST_CHANNEL_KEY' <<<"$out" && ng "안 준 키가 생김" || ok

# .env.local 이 있으면 거부 — 없을 때만 임시 심링크를 만들고 반드시 지운다
target="$ROOT/apps/client/.env.local"
if [[ ! -e "$target" && ! -L "$target" ]]; then
  ln -s /nonexistent "$target"
  trap 'rm -f "$target"' EXIT
  expect_refuse ".env.local 심링크" dev 3099
  rm -f "$target"
  trap - EXIT
else
  ng ".env.local 이 이미 있다 — 테스트 불가(그리고 봉투는 기동을 거부한다)"
fi

echo "client-walk-server: $pass pass · $fail fail"
[[ $fail -eq 0 ]]
