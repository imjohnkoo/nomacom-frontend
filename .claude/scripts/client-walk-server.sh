#!/usr/bin/env bash
# client-walk-server.sh — apps/client 로컬 walk 전용 서버 (QA ⑦ · spec client-shell E2E-0 ③ · D-18)
#
# John 지시(2026-09-23): 로컬 walk 에서 prod DB 의 데이터를 수정하지 않는다 · 실제 전화번호로 메시지가 가지 않는다.
# 안전 봉투:
#  1. env -i 로 셸 환경을 버리고 허용 목록만 넘긴다. 셸의 SPARK_* · MAYA_* · ESIM_MANAGER_INTERNAL_* · CORS_EXTRA_ORIGINS 는
#     넘기지 않는다 → activate 는 벤더 호출 · DB 쓰기 전에(useSparkApi / useMayaApi 첫 줄) 실패하고, 취소철회는 DB 조회
#     전에 503 이다. Spark/Maya 실발급 · backend 위임 · 네이버 호출 · 알림 경로 0 (client 에 SMS · 알림톡 코드는 없다).
#     CORS_EXTRA_ORIGINS 는 봉투가 자기 포트(localhost · 127.0.0.1) 값만 만든다 — 브라우저는 같은 출처 POST 에도
#     Origin 을 붙이므로 이것 없이는 walk 포트의 /api/** 가 403 이다.
#  2. yarn 을 거치지 않고 node 로 직접 띄운다(yarn 의 .env.yarn 주입 차단) · 127.0.0.1 에만 묶는다.
#     dev 는 --dotenv /dev/null — 기동 뒤에 .env 가 생겨도 nuxt 가 재시작하며 읽어 들이지 않게(기본은 .env 를 감시한다).
#  3. DATABASE_URL 은 dev 모드에서만, postgres://<영숫자>:<영숫자>@127.0.0.1:55432/<영숫자> 전체 일치만 받고,
#     실제 기동 때 55432 를 듣는 프로세스가 로컬 컨테이너 · postgres 인지 본다(SSM · ssh 터널로 prod RDS 를 55432 에
#     연 경우 차단). prod 모드는 DB 인자를 거부한다 — prod 빌드는 ssl:require 라 닿는 곳이 TLS 를 말하는 prod RDS 뿐이다.
#  4. 이 워크트리의 apps/client/.env(.local) · 루트 .env(.local) 가 있으면 기동 거부. nuxt 는 apps/client 에서 dotenv 를
#     읽는다 — 메인 클론 파일은 영향이 없어 보지 않는다(워크트리의 .env.local 심링크는 그 링크만 지운다 · 원본 금지).
#  5. NUXT_PUBLIC_PORTONE_STORE_ID · NUXT_PUBLIC_PORTONE_TEST_CHANNEL_KEY(공개값)만 호출자 환경에서 받는다 — E2E-6 용.
#
# 사용:  bash .claude/scripts/client-walk-server.sh dev  <port> [합성 DB url]   # nuxt dev(dev 는 DB ssl:false → 합성 DB 가능)
#        bash .claude/scripts/client-walk-server.sh prod <port>                 # .output 빌드 · DB 없음(헤더 · noindex 확인용)
#        WALK_DRY_RUN=1 bash … dev 3005                                          # 넘길 env 만 출력하고 끝
#        브라우저는 http://localhost:<port> 로 연다(127.0.0.1 도 CORS 허용).
# 증거:  ps -E -o command= -p <pid> | tr ' ' '\n' | grep -E '^(SPARK|MAYA|ESIM_MANAGER|DATABASE_URL|CORS_EXTRA)'
#        → SPARK · MAYA · ESIM_MANAGER 0 · DATABASE_URL 은 없거나 127.0.0.1:55432 · CORS 는 자기 포트 값뿐
# 회귀:  bash .claude/scripts/client-walk-server.test.sh (가짜 node 로 실제 기동 경로까지 본다)
set -euo pipefail

refuse() {
  echo "⛔ $1 — 기동 거부" >&2
  exit 2
}

MODE="${1:-}"
PORT="${2:-}"
DB_URL="${3:-}"
[[ "$MODE" == dev || "$MODE" == prod ]] || refuse "사용: $0 dev|prod <port> [합성 DB url]"
[[ "$PORT" =~ ^[0-9]{4,5}$ ]] || refuse "포트는 숫자 4~5자리"

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

for f in "$ROOT/apps/client/.env" "$ROOT/apps/client/.env.local" "$ROOT/.env" "$ROOT/.env.local"; do
  if [[ -e "$f" || -L "$f" ]]; then
    refuse "$f 가 있다 — prod 값 유입 위험 (워크트리의 심링크면 링크만 지운다 · 메인 클론 원본은 건드리지 않는다)"
  fi
done

if [[ -n "$DB_URL" ]]; then
  [[ "$MODE" == dev ]] || refuse "prod 모드는 DB 인자를 받지 않는다"
  [[ "$DB_URL" =~ ^postgres(ql)?://[A-Za-z0-9_]+:[A-Za-z0-9_]+@127\.0\.0\.1:55432/[A-Za-z0-9_]+$ ]] ||
    refuse "DATABASE_URL 은 postgres://<영숫자>:<영숫자>@127.0.0.1:55432/<영숫자> 만 허용"
fi

NODE="$(command -v node)"
ALLOW=(
  "PATH=/usr/bin:/bin:/usr/sbin:/sbin:$(dirname "$NODE")"
  "HOME=$HOME"
  "PORT=$PORT"
  "HOST=127.0.0.1"
  "NUXT_PUBLIC_GUEST_APP_ORIGIN=http://localhost:$PORT"
  "CORS_EXTRA_ORIGINS=http://localhost:$PORT,http://127.0.0.1:$PORT"
)
if [[ -n "$DB_URL" ]]; then ALLOW+=("DATABASE_URL=$DB_URL"); fi
for key in NUXT_PUBLIC_PORTONE_STORE_ID NUXT_PUBLIC_PORTONE_TEST_CHANNEL_KEY; do
  if [[ -n "${!key:-}" ]]; then ALLOW+=("$key=${!key}"); fi
done

if [[ -n "${WALK_DRY_RUN:-}" ]]; then
  printf '%s\n' "${ALLOW[@]}" | sed -E 's/^(NUXT_PUBLIC_PORTONE_[A-Z_]+)=.*/\1=***/'
  exit 0
fi

if [[ -n "$DB_URL" ]]; then
  # 55432 를 듣는 게 로컬 컨테이너 · postgres 여야 한다 — SSM 포트포워딩(session-manager-plugin) · ssh 터널이면 prod RDS 다
  listener="$(lsof -nP +c 0 -iTCP:55432 -sTCP:LISTEN -Fc 2>/dev/null | sed -n 's/^c//p' | head -1 || true)"
  [[ -n "$listener" ]] || refuse "127.0.0.1:55432 를 듣는 프로세스가 없다 — 합성 DB 컨테이너부터"
  [[ "$listener" =~ ^(com\.docker\.|docker|vpnkit|postgres|OrbStack|orbstack|limactl|colima) ]] ||
    refuse "55432 를 듣는 프로세스가 로컬 DB 가 아니다($listener) — 터널이면 prod 다"
fi

cd "$ROOT/apps/client"
if [[ "$MODE" == dev ]]; then
  exec env -i "${ALLOW[@]}" "$NODE" "$ROOT/node_modules/nuxt/bin/nuxt.mjs" dev --port "$PORT" --host 127.0.0.1 --dotenv /dev/null
fi
[[ -f .output/server/index.mjs ]] || refuse ".output 없음 — yarn turbo run build --filter=nomacom-client 먼저"
exec env -i "${ALLOW[@]}" "$NODE" .output/server/index.mjs
