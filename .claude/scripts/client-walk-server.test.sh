#!/usr/bin/env bash
# client-walk-server.sh 회귀 테스트 — 서버를 띄우지 않는다.
# 거부 경로 + WALK_DRY_RUN 출력 + **실제 기동 줄**(PATH 앞의 가짜 node 가 받은 env · 인자 · cwd 를 출력하고 끝난다).
# 사용: bash .claude/scripts/client-walk-server.test.sh
set -uo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
S="$DIR/client-walk-server.sh"
ROOT="$(cd "$DIR/../.." && pwd)"
FAKE="$(mktemp -d)" || { echo "mktemp 실패 — 중단(가짜 node 없이 돌면 실제 서버가 뜬다)"; exit 1; }
[[ -n "$FAKE" && -d "$FAKE" ]] || { echo "가짜 bin 디렉터리 없음 — 중단"; exit 1; }
cleanup_paths=("$FAKE")
trap 'rm -rf "${cleanup_paths[@]}"' EXIT
pass=0
fail=0

ok() { pass=$((pass + 1)); }
ng() { fail=$((fail + 1)); echo "FAIL: $1"; }
has() { grep -qxF -- "$2" <<<"$1" && ok || ng "$3"; }
lacks() { grep -qE -- "$2" <<<"$1" && ng "$3" || ok; }

expect_refuse() { # 설명 · 인자…
  local name="$1"; shift
  if WALK_DRY_RUN=1 bash "$S" "$@" >/dev/null 2>&1; then ng "$name (거부돼야 함)"; else
    [[ $? -eq 2 ]] && ok || ng "$name (exit 2 아님)"
  fi
}

# 가짜 node — 받은 것을 그대로 출력(실제 nuxt · 서버는 뜨지 않는다)
cat >"$FAKE/node" <<'EOF'
#!/bin/sh
echo "CWD=$(pwd -P)"
for a in "$@"; do echo "ARG=$a"; done
env | sed 's/^/ENV:/'
EOF
chmod +x "$FAKE/node"
# 가짜 lsof — 포트별 리스너 이름을 환경변수로 준다(FAKE_LSOF_55432 · FAKE_LSOF_WALK, 공백 구분). 실제 소켓은 열지 않는다
cat >"$FAKE/lsof" <<'EOF'
#!/bin/sh
case "$*" in
  *-iTCP:55432*) names="$FAKE_LSOF_55432" ;;
  *) names="$FAKE_LSOF_WALK" ;;
esac
for n in $names; do echo "p1"; echo "c$n"; done
EOF
chmod +x "$FAKE/lsof"
run_real() { PATH="$FAKE:$PATH" bash "$S" "$@" 2>&1; }
real_exit() { PATH="$FAKE:$PATH" bash "$S" "$@" >/dev/null 2>&1; echo $?; }
export FAKE_LSOF_55432="" FAKE_LSOF_WALK=""

# 셸에 금지 키가 있어도 새지 않아야 한다
export SPARK_API_TOKEN=leak MAYA_API_CLIENT_SECRET=leak ESIM_MANAGER_INTERNAL_SECRET=leak
export CORS_EXTRA_ORIGINS=https://evil.example DATABASE_URL=postgres://u:p@prod.example.com:5432/db

# ── 거부 경로
expect_refuse "모드 없음"
expect_refuse "잘못된 모드" bogus 3099
expect_refuse "포트 형식" dev abc
expect_refuse "비로컬 DB" dev 3099 'postgres://u:p@db.example.com:5432/x'
expect_refuse "로컬 다른 포트" dev 3099 'postgres://u:p@127.0.0.1:5432/x'
expect_refuse "조각으로 호스트 위장" dev 3099 'postgres://a:b@prod.example.com:5432#@127.0.0.1:55432/x'
expect_refuse "쿼리로 호스트 위장" dev 3099 'postgres://a:b@127.0.0.1:55432/x?host=prod.example.com'
expect_refuse "사용자 칸에 호스트" dev 3099 'postgres://prod.example.com:5432:b@127.0.0.1:55432/x'
expect_refuse "prod 모드 DB" prod 3099 'postgres://walk:walk@127.0.0.1:55432/walk'

# ── dry-run 허용 목록
out="$(WALK_DRY_RUN=1 bash "$S" dev 3099 2>&1)" || ng "dev 3099 dry-run 실패"
has "$out" 'CORS_EXTRA_ORIGINS=http://127.0.0.1:3099' "CORS 자기 포트 값(127.0.0.1 만)"
has "$out" 'HOST=127.0.0.1' "127.0.0.1 바인딩"
has "$out" 'NUXT_PUBLIC_GUEST_APP_ORIGIN=http://127.0.0.1:3099' "발급 호스트(127.0.0.1)"
lacks "$out" 'localhost' "localhost 없음(::1 로 봉투 밖 서버에 닿는다)"
lacks "$out" '^(SPARK|MAYA|ESIM_MANAGER)' "벤더 · 내부 키 누출(dry-run)"
lacks "$out" 'evil\.example' "셸 CORS 값 누출(dry-run)"
lacks "$out" '^DATABASE_URL=' "DB 인자 없는데 DATABASE_URL(dry-run)"

out="$(NUXT_PUBLIC_PORTONE_STORE_ID=store-x WALK_DRY_RUN=1 bash "$S" prod 3099 2>&1)" || ng "PortOne dry-run 실패"
has "$out" 'NUXT_PUBLIC_PORTONE_STORE_ID=***' "PortOne 공개키 통로(마스킹)"
lacks "$out" 'NUXT_PUBLIC_PORTONE_TEST_CHANNEL_KEY' "안 준 키가 생김"

# ── 실제 기동 줄 (dev) — env -i · 인자 · cwd
out="$(run_real dev 3099)" || ng "dev 실제 기동 줄 실패"
CLIENT_P="$(cd "$ROOT/apps/client" && pwd -P)"
has "$out" "CWD=$CLIENT_P" "dev cwd = apps/client"
has "$out" "ARG=$ROOT/node_modules/nuxt/bin/nuxt.mjs" "yarn 미경유 — nuxt.mjs 직접"
has "$out" 'ARG=--host' "--host 인자"
has "$out" 'ARG=127.0.0.1' "--host 127.0.0.1"
has "$out" 'ARG=--dotenv' "--dotenv 인자"
has "$out" 'ARG=/dev/null' "--dotenv /dev/null (기동 뒤 .env 무시)"
has "$out" 'ARG=--port' "--port 인자"
has "$out" 'ARG=3099' "--port 3099"
has "$out" 'ENV:CORS_EXTRA_ORIGINS=http://127.0.0.1:3099' "실제 env CORS 값"
has "$out" 'ENV:NUXT_PUBLIC_GUEST_APP_ORIGIN=http://127.0.0.1:3099' "실제 env 발급 호스트"
has "$out" 'ENV:HOST=127.0.0.1' "실제 env HOST"
lacks "$out" '^ENV:(SPARK|MAYA|ESIM_MANAGER)' "실제 env 벤더 · 내부 키 누출"
lacks "$out" '^ENV:DATABASE_URL=' "실제 env 셸 DATABASE_URL 누출"
lacks "$out" 'evil\.example' "실제 env 셸 CORS 누출"
# env -i 가 빠지면 셸 변수가 통째로 들어온다 — 키가 허용 목록(+ 가짜 셸이 스스로 붙이는 PWD · SHLVL · _ · OLDPWD) 안이어야 한다
extra="$(sed -n 's/^ENV:\([^=]*\)=.*/\1/p' <<<"$out" | grep -vxE 'PATH|HOME|PORT|HOST|NUXT_PUBLIC_GUEST_APP_ORIGIN|CORS_EXTRA_ORIGINS|PWD|SHLVL|_|OLDPWD' || true)"
[[ -z "$extra" ]] && ok || ng "실제 env 에 허용 밖 키: $(tr '\n' ' ' <<<"$extra") — env -i 빠짐?"

# ── 실제 기동 줄 (prod)
if [[ -f "$ROOT/apps/client/.output/server/index.mjs" ]]; then
  out="$(run_real prod 3099)" || ng "prod 실제 기동 줄 실패"
  has "$out" 'ARG=.output/server/index.mjs' "prod 는 .output 직접"
  has "$out" "CWD=$CLIENT_P" "prod cwd = apps/client"
  lacks "$out" '^ENV:(SPARK|MAYA|ESIM_MANAGER|DATABASE_URL)' "prod 실제 env 누출"
else
  run_real prod 3099 >/dev/null
  [[ $? -eq 2 ]] && ok || ng "prod — .output 없으면 거부"
fi

# ── walk 포트를 누가 이미 듣고 있으면 거부(localhost → ::1 봉투 밖 서버 · nuxi 포트 대체 차단)
[[ "$(FAKE_LSOF_WALK=node real_exit dev 3099)" -eq 2 ]] && ok || ng "walk 포트 점유 → 거부"
[[ "$(FAKE_LSOF_WALK=node real_exit prod 3099)" -eq 2 ]] && ok || ng "walk 포트 점유 → 거부(prod)"

# ── 실제 기동 + 합성 DB: 55432 리스너가 전부 로컬 DB 일 때만(터널 차단)
DBU='postgres://walk:walk@127.0.0.1:55432/walk'
[[ "$(FAKE_LSOF_55432="" real_exit dev 3099 "$DBU")" -eq 2 ]] && ok || ng "55432 리스너 없음 → 거부"
[[ "$(FAKE_LSOF_55432="ssh" real_exit dev 3099 "$DBU")" -eq 2 ]] && ok || ng "55432 = ssh 터널 → 거부"
[[ "$(FAKE_LSOF_55432="session-manager-plugin" real_exit dev 3099 "$DBU")" -eq 2 ]] && ok || ng "55432 = SSM 터널 → 거부"
[[ "$(FAKE_LSOF_55432="com.docker.backend ssh" real_exit dev 3099 "$DBU")" -eq 2 ]] && ok || ng "Docker + 터널 공존 → 거부"
[[ "$(FAKE_LSOF_55432="ssh com.docker.backend" real_exit dev 3099 "$DBU")" -eq 2 ]] && ok || ng "터널 + Docker(순서 반대) → 거부"
out="$(FAKE_LSOF_55432="com.docker.backend" run_real dev 3099 "$DBU")" || ng "Docker 리스너 기동 줄 실패"
has "$out" "ENV:DATABASE_URL=$DBU" "로컬 DB 리스너면 합성 DATABASE_URL 전달"

# ── 실제 기동에서 PortOne 공개키 통로
out="$(NUXT_PUBLIC_PORTONE_STORE_ID=store-x NUXT_PUBLIC_PORTONE_TEST_CHANNEL_KEY=channel-key-test-x run_real dev 3099)" || ng "PortOne 실제 기동 줄 실패"
has "$out" 'ENV:NUXT_PUBLIC_PORTONE_STORE_ID=store-x' "실제 env PortOne storeId 전달"
has "$out" 'ENV:NUXT_PUBLIC_PORTONE_TEST_CHANNEL_KEY=channel-key-test-x' "실제 env PortOne 테스트 채널키 전달"

# ── lsof 가 실패하면(없음 · 오류) 기동하지 않는다 — «리스너 없음» 으로 읽지 않게
cat >"$FAKE/lsof-broken" <<'EOF'
#!/bin/sh
exit 3
EOF
chmod +x "$FAKE/lsof-broken"
BROKEN="$(mktemp -d)" || exit 1
cleanup_paths+=("$BROKEN")
cp "$FAKE/node" "$BROKEN/node"
cp "$FAKE/lsof-broken" "$BROKEN/lsof"
PATH="$BROKEN:$PATH" bash "$S" dev 3099 >/dev/null 2>&1
[[ $? -eq 2 ]] && ok || ng "lsof 오류 → 거부"

# ── .env 계열이 있으면 거부 — 없을 때만 임시 심링크를 만들고 반드시 지운다
for rel in apps/client/.env.local apps/client/.env .env .env.local; do
  target="$ROOT/$rel"
  if [[ -e "$target" || -L "$target" ]]; then
    ng "$rel 이 이미 있다 — 테스트 불가(그리고 봉투는 기동을 거부한다)"
    continue
  fi
  ln -s /nonexistent "$target"
  cleanup_paths+=("$target")
  expect_refuse "$rel 심링크" dev 3099
  rm -f "$target"
done

echo "client-walk-server: $pass pass · $fail fail"
[[ $fail -eq 0 ]]
