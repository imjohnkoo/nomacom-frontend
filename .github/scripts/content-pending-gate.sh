#!/usr/bin/env bash
# 콘텐츠 자리표시자 게이트 — client 판매 사이트(W1-2 · spec D-17).
#
# 사업자정보 · 고객센터 · 약관 · 처리방침 · 환불정책의 확정 전 값은 `P9_4_PENDING` 으로 두고 화면에 «(확정 전)» 을 보인다.
# frontend 는 prod = main 의 한 SHA 라, main 에 들어간 자리표시자는 다음 prod 승격(핫픽스 포함)에 그대로 나간다.
# → 이 스크립트가 0 으로 끝나야 main 머지 옵션을 연다. 부르는 곳: nomacomfe-finish-branch Step 0 첫 항목(모든 Tier) ·
#   CI content-gate job(GitHub UI 머지 경로) · nomacomfe-prod-push-check Phase 3(승격 직전).
#
# 보는 것: **머지할 커밋**(기본 HEAD)의 apps/client/** — 디스크 파일이 아니다(워크트리에서만 채우고 커밋하지 않은 값은 통과가 아니다).
# 세지 않는 것: 자리표시자 정의 · 판정 함수 파일(app/content/pending.ts) · 테스트 픽스처(*.test.ts) · 문서(*.md).
#
# 사용: bash .github/scripts/content-pending-gate.sh [rev]
# 종료: 0 = 없음 · 1 = 남아 있음(main 머지 불가 — PR 은 draft 로) · 2 = 검사 불가(통과로 보지 않는다)
# 회귀: bash .github/scripts/content-pending-gate.test.sh
set -uo pipefail

ROOT="${CONTENT_GATE_ROOT:-$(cd "$(dirname "$0")/../.." && pwd)}"
REV="${1:-HEAD}"

if ! git -C "$ROOT" rev-parse --verify --quiet "$REV^{commit}" >/dev/null; then
  echo "⛔ 리비전 $REV 를 찾을 수 없다 — 검사 불가" >&2
  exit 2
fi
if ! git -C "$ROOT" cat-file -e "$REV:apps/client/app" 2>/dev/null; then
  echo "⛔ $REV 에 apps/client/app 이 없다 — 검사 불가" >&2
  exit 2
fi

errf="$(mktemp)"
trap 'rm -f "$errf"' EXIT
hits="$(git -C "$ROOT" grep -l -I -F 'P9_4_PENDING' "$REV" -- apps/client \
  ':(exclude)apps/client/app/content/pending.ts' ':(exclude)*.test.ts' ':(exclude)*.md' 2>"$errf")"
rc=$?
# git grep 은 객체를 못 읽어도 «못 찾음»(1)으로 끝날 수 있다 — stderr 가 있으면 검사 불가
if [[ -s "$errf" ]]; then
  echo "⛔ git grep 오류 — 검사 불가:" >&2
  sed 's/^/    /' "$errf" >&2
  exit 2
fi

case $rc in
  0)
    echo "⛔ 확정 전 콘텐츠(P9_4_PENDING)가 남아 있다 — main 머지 불가 (PR 은 draft 로) [$REV]:"
    printf '%s\n' "$hits" | sed "s|^$REV:|    |"
    echo "   (값을 다 채웠다면 import 줄의 P9_4_PENDING 도 지워야 한다 — 글자 하나라도 남으면 막힌다)"
    exit 1
    ;;
  1)
    echo "✔ 콘텐츠 자리표시자 없음 [$REV]"
    exit 0
    ;;
  *)
    echo "⛔ git grep 실패(exit $rc) — 검사 불가" >&2
    exit 2
    ;;
esac
