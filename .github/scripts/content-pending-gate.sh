#!/usr/bin/env bash
# 콘텐츠 자리표시자 게이트 — client 판매 사이트(W1-2 · spec D-17).
#
# 사업자정보 · 고객센터 · 약관 · 처리방침 · 환불정책의 확정 전 값은 `P9_4_PENDING` 으로 두고 화면에 «(확정 전)» 을 보인다.
# frontend 는 prod = main 의 한 SHA 라, main 에 들어간 자리표시자는 다음 prod 승격(핫픽스 포함)에 그대로 나간다.
# → 이 스크립트가 0 으로 끝나야 main 머지 옵션을 연다. 부르는 곳: nomacomfe-finish-branch Step 0 첫 항목(모든 Tier) ·
#   nomacomfe-prod-push-check Phase 3(승격 SHA) · CI content-gate job(알림 — required check 아님).
#
# 보는 것: **머지할 커밋**(기본 HEAD)의 apps/client/** — 디스크 파일이 아니다(워크트리에서만 채우고 커밋하지 않은 값은 통과가 아니다).
#   바이너리 속성(.gitattributes -diff 등)이 붙은 파일도 텍스트로 본다.
# 세지 않는 것: 자리표시자 정의 · 판정 함수 파일(app/content/pending.ts) · 테스트 픽스처(*.test.ts) · 문서(*.md).
#   pending.ts 는 정해진 이름만 내보내야 한다 — 별칭(export const TBD = P9_4_PENDING)으로 게이트를 비껴가지 않게.
#
# 사용: bash .github/scripts/content-pending-gate.sh [rev]
# 종료: 0 = 없음 · 1 = 남아 있음(main 머지 불가 — PR 은 draft 로) · 2 = 검사 불가(통과로 보지 않는다)
# 회귀: bash .github/scripts/content-pending-gate.test.sh (CONTENT_GATE_ROOT 는 그 테스트용 — 출력에 검사한 경로가 찍힌다)
set -uo pipefail

unable() {
  echo "⛔ $1 — 검사 불가" >&2
  exit 2
}

ROOT="${CONTENT_GATE_ROOT:-$(cd "$(dirname "$0")/../.." && pwd)}"
if [[ $# -ge 1 && -z "$1" ]]; then unable "빈 리비전 인자"; fi
REV="${1:-HEAD}"
PENDING_FILE=apps/client/app/content/pending.ts
PENDING_EXPORTS='P9_4_PENDING Pending ContentValue PENDING_LABEL isPending displayValue'

git -C "$ROOT" rev-parse --verify --quiet "$REV^{commit}" >/dev/null || unable "리비전 $REV 를 찾을 수 없다"
git -C "$ROOT" cat-file -e "$REV:apps/client/app" 2>/dev/null || unable "$REV 에 apps/client/app 이 없다"

errf="$(mktemp 2>/dev/null)" || errf=""
[[ -n "$errf" && -f "$errf" ]] || unable "임시 파일을 만들 수 없다"
trap 'rm -f "$errf"' EXIT

hits="$(git -C "$ROOT" grep -l --text -F 'P9_4_PENDING' "$REV" -- apps/client \
  ":(exclude)$PENDING_FILE" ':(exclude)*.test.ts' ':(exclude)*.md' 2>"$errf")"
rc=$?
# git grep 은 객체를 못 읽어도 «못 찾음»(1)으로 끝날 수 있다 — stderr 가 있으면 검사 불가
if [[ -s "$errf" ]]; then
  sed 's/^/    /' "$errf" >&2
  unable "git grep 오류"
fi
[[ $rc -eq 0 || $rc -eq 1 ]] || unable "git grep 실패(exit $rc)"

# pending.ts 가 정해진 이름만 내보내는가(별칭 · 재수출 금지)
extra=""
if git -C "$ROOT" cat-file -e "$REV:$PENDING_FILE" 2>/dev/null; then
  pending_src="$(git -C "$ROOT" show "$REV:$PENDING_FILE" 2>"$errf")" || unable "$PENDING_FILE 를 읽을 수 없다"
  while IFS= read -r line; do
    name="$(sed -nE 's/^export[[:space:]]+(declare[[:space:]]+)?(const|let|var|function|type|interface|enum|class)[[:space:]]+([A-Za-z0-9_$]+).*/\3/p' <<<"$line")"
    if [[ -z "$name" ]] || ! grep -qw -- "$name" <<<"$PENDING_EXPORTS"; then extra+="    $PENDING_FILE: $line"$'\n'; fi
  done < <(grep -E '^[[:space:]]*export\b' <<<"$pending_src" || true)
fi

if [[ $rc -eq 0 || -n "$extra" ]]; then
  echo "⛔ 확정 전 콘텐츠(P9_4_PENDING)가 남아 있다 — main 머지 불가 (PR 은 draft 로) [$REV @ $ROOT]:"
  [[ $rc -eq 0 ]] && printf '%s\n' "$hits" | sed "s|^$REV:|    |"
  [[ -n "$extra" ]] && printf '%s' "$extra" && echo "    (pending.ts 는 $PENDING_EXPORTS 만 내보낸다 — 별칭 · 재수출 금지)"
  echo "   (값을 다 채웠다면 import 줄의 P9_4_PENDING 도 지워야 한다 — 글자 하나라도 남으면 막힌다)"
  exit 1
fi

echo "✔ 콘텐츠 자리표시자 없음 [$REV @ $ROOT]"
exit 0
