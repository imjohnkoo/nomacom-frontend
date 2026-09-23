#!/usr/bin/env bash
# client-walk-server.sh — apps/client 로컬 walk 전용 서버 (QA ⑦ · spec client-shell E2E-0 ③ · D-18)
#
# John 지시(2026-09-23): 로컬 walk 에서 prod DB 의 데이터를 수정하지 않는다 · 실제 전화번호로 메시지가 가지 않는다.
# 안전 봉투:
#  1. env -i 로 셸 환경을 버리고 허용 목록만 넘긴다. SPARK_* · MAYA_* · ESIM_MANAGER_INTERNAL_* · CORS_EXTRA_ORIGINS 는
#     넘기지 않는다 → activate 는 벤더 호출 · DB 쓰기 전에(useSparkApi / useMayaApi 첫 줄) 실패하고, 취소철회는 DB 조회
#     전에 503 이다. Spark/Maya 실발급 · backend 위임 · 네이버 호출 · 알림 경로 0 (client 에 SMS · 알림톡 코드는 없다).
#  2. DATABASE_URL 은 로컬 합성 DB(127.0.0.1:55432)만 받는다 — 다른 호스트면 기동 거부. 주지 않으면 DB 없이 뜬다.
#  3. .env · .env.local(이 워크트리 · 메인 클론)이 있으면 기동 거부 — nuxt 의 dotenv 로드가 prod 값을 끌어오는 것 차단.
#
# 사용:  bash .claude/scripts/client-walk-server.sh dev  <port> [합성 DB url]   # nuxt dev(dev 는 DB ssl:false → 합성 DB 가능)
#        bash .claude/scripts/client-walk-server.sh prod <port>                 # .output 빌드 · DB 없음(헤더 · noindex 확인용)
# 증거:  ps -E -o command= -p <pid> | tr ' ' '\n' | grep -E '^(SPARK|MAYA|ESIM_MANAGER|CORS_EXTRA)'   # 빈 결과여야 한다
set -euo pipefail

MODE="${1:?dev|prod}"
PORT="${2:?port}"
DB_URL="${3:-}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
MAIN="$(git -C "$ROOT" worktree list --porcelain | awk '/^worktree /{print $2; exit}')"

for f in "$ROOT/apps/client/.env" "$ROOT/apps/client/.env.local" "$MAIN/apps/client/.env" "$MAIN/apps/client/.env.local"; do
  if [[ -e "$f" || -L "$f" ]]; then
    echo "⛔ $f 가 있다 — prod 값 유입 위험, 기동 거부" >&2
    exit 2
  fi
done

if [[ -n "$DB_URL" && ! "$DB_URL" =~ ^postgres(ql)?://[^@/]+@127\.0\.0\.1:55432/ ]]; then
  echo "⛔ DATABASE_URL 은 로컬 합성 DB(127.0.0.1:55432)만 허용 — 기동 거부" >&2
  exit 2
fi

ALLOW=(
  "PATH=/usr/bin:/bin:/usr/sbin:/sbin:$(dirname "$(command -v node)")"
  "HOME=$HOME"
  "PORT=$PORT"
  "NUXT_PUBLIC_GUEST_APP_ORIGIN=http://localhost:$PORT"
)
if [[ -n "$DB_URL" ]]; then ALLOW+=("DATABASE_URL=$DB_URL"); fi

cd "$ROOT/apps/client"
case "$MODE" in
  dev) exec env -i "${ALLOW[@]}" "$(command -v yarn)" nuxt dev --port "$PORT" ;;
  prod)
    [[ -f .output/server/index.mjs ]] || { echo "⛔ .output 없음 — yarn turbo run build --filter=nomacom-client 먼저" >&2; exit 2; }
    exec env -i "${ALLOW[@]}" "$(command -v node)" .output/server/index.mjs
    ;;
  *) echo "사용: $0 dev|prod <port> [합성 DB url]" >&2; exit 2 ;;
esac
