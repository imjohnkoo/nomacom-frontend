#!/usr/bin/env bash
# 콘텐츠 자리표시자 게이트 — client 판매 사이트(W1-2 · spec D-17).
#
# 사업자정보 · 고객센터 · 약관 · 처리방침 · 환불정책의 확정 전 값은 `P9_4_PENDING` 으로 두고 화면에 «(확정 전)» 을 보인다.
# frontend 는 prod = main 의 한 SHA 라, main 에 들어간 자리표시자는 다음 prod 승격(핫픽스 포함)에 그대로 나간다.
# → 이 스크립트가 0 으로 끝나야 main 머지 옵션을 연다(nomacomfe-finish-branch Step 0).
#
# 세지 않는 것: 자리표시자 정의 · 판정 함수 파일(app/content/pending.ts)과 테스트 픽스처(*.test.ts).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
CLIENT="$ROOT/apps/client"

hits="$(grep -rl --include='*.ts' --include='*.vue' 'P9_4_PENDING' \
  "$CLIENT/app" "$CLIENT/shared" "$CLIENT/server" 2>/dev/null \
  | grep -v -E '/app/content/pending\.ts$|\.test\.ts$' || true)"

if [[ -n "$hits" ]]; then
  echo "⛔ 확정 전 콘텐츠(P9_4_PENDING)가 남아 있다 — main 머지 불가 (PR 은 draft 로):"
  printf '%s\n' "$hits" | sed "s|$ROOT/|    |"
  exit 1
fi

echo "✔ 콘텐츠 자리표시자 없음"
