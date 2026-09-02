---
name: nomacomfe-prod-push-check
description: Pre-flight checklist before pushing to nomacom-frontend prod or merging to the prod branch. Verifies build, typecheck, tests for affected apps (via paths filter), clean working tree, dev sync plan, DS version bump, and migration safety. Use before any push that triggers admin/client prod deploy.
---

# nomacom-frontend Prod Push Check

Prevent broken/unsafe prod deployments by running a structured pre-flight check.

**Announce at start:** "I'm using the nomacomfe-prod-push-check skill to verify prod-push readiness."

> **현 상태 주의 (2026-05)**: nomacom-frontend 는 prod 배포 파이프라인 자체가 아직 부트스트랩 중. 본 skill 은 A 트랙 (`.claude/rules/deployment.md`) 완료 후 본격 의미. 그 전까지는 dev 환경 검증 또는 `main` 단독 운영 시점에는 Phase 7 (dev sync) 가 NO-OP 일 수 있음.

## When to Use

**MUST use before:**
- `git push origin prod` (브랜치 분리 후)
- Merging any PR into `prod`
- Creating a PR targeting `prod`
- Any force-push involving `prod` (basically never — warn and stop)

**Not needed for:**
- Pushing to feature branches
- Pushing to `dev` 또는 (현재) `main`
- Local merges that don't push

## Check Phases

### Phase 1 — Working Tree Hygiene

```bash
# 1.1 Clean?
git status --porcelain
```
비어있어야 함. 있으면 stash/commit 결정 필요.

```bash
# 1.2 Unpushed commits 파악
git log origin/<current-branch>..HEAD --oneline
```

```bash
# 1.3 .env / 시크릿 실수 포함 여부 (.env.example 은 제외)
git diff origin/prod...HEAD --name-only \
  | grep -E "\.env($|\.local|\.production)|credentials|secret|\.key$|\.pem$" \
  | grep -v '\.env\.example$'
```
매칭되면 **stop**. 시크릿이 staged/committed되면 안 됨.

### Phase 2 — Paths Filter 영향 분석

변경된 파일로 **어떤 앱이 재배포되는지** 판정 (`.github/workflows/admin-production.yml`, `client-production.yml` 룰 참조):

```bash
git diff origin/prod...HEAD --name-only
```

| 변경 경로 | 트리거 workflow |
|---|---|
| `apps/admin/**` | admin-production.yml |
| `apps/client/**` | client-production.yml |
| `apps/mobile/**` | (별도 — Expo EAS / OTA, CodeDeploy 와 분리) |
| `packages/design-tokens/**` | **둘 다** (admin + client) |
| `packages/design-vue/**` | **둘 다** (admin + client) |
| `packages/design-mobile/**` | mobile only (EAS) |
| `package.json`, `yarn.lock` (root) | **둘 다** (admin + client) |
| `deploy/scripts/**`, `appspec.yml` | **둘 다** |
| `.github/workflows/admin-production.yml` | admin |
| `.github/workflows/client-production.yml` | client |
| `packages/design-*/**` (main 브랜치 + publish 정책 채택 시) | + design-system-publish.yml |
| `turbo.json`, `tsconfig.base.json`, `.yarnrc.yml`, `apps/design-*/**` | **제외** (workflow paths 필터에 없음 — 확인 필요) |

**출력 포맷**:
```
Paths-filter 영향:
  ✓ admin   (reason: apps/admin/server/api/...)
  ✓ client  (reason: packages/design-vue/components/...)
  - mobile  (reason: 변경 없음)
  - DS publish: ✗ (prod 브랜치는 publish 안 함, main에서만)
```

### Phase 3 — Build + Typecheck 검증

Turbo로 전체 또는 영향 앱만:

```bash
yarn turbo run build || exit 1
# 또는 영향 앱만:
# yarn turbo run build --filter=nomacom-admin --filter=nomacom-client

yarn turbo run typecheck || exit 1
```

**Fail이면 stop**. 빌드 안 되는 코드 prod 금지.

### Phase 4 — 영향 앱 테스트 + UI 검증

Phase 2에서 판정된 앱만 테스트:

```bash
yarn turbo run test --filter=nomacom-admin --filter=nomacom-client
```

`verification-before-completion` 의 iron law 적용 — 결과를 직접 확인.

**UI 변경이 포함된 경우** 추가로:
- 영향 앱 dev 서버 띄워서 (`yarn workspace nomacom-admin run dev`) golden path 수동 검증
- 자동 테스트는 feature correctness 가 아닌 code correctness 만 검증함

### Phase 5 — 마이그레이션/DB 변경 안전성

nomacom-frontend 도 Drizzle 사용 (`apps/admin/server/`, `apps/client/server/`):

```bash
# 마이그레이션 파일
git diff origin/prod...HEAD --name-only | grep -E "migrations/|schema\.ts$|drizzle\.config\.ts$"

# 대규모 UPDATE / 인덱스 변경
git diff origin/prod...HEAD | grep -iE "CREATE INDEX|DROP INDEX|ALTER TABLE|UPDATE.*SET"
```

**매칭 시 체크**:
- nomacom 의 DB ownership 구조 확인 (admin vs client vs 공유). 현재 nomacom-admin / nomacom-client 가 동일 DB 공유 여부 결정 필요
- DDL: prod DB 에 적용 계획/타이밍 확인 (배포 전/후?), lock 시간 예측
- Maya 응답 schema 변경에 대응한 컬럼 추가 등은 client 결제/조회 흐름과 동시 cutover 필요

### Phase 6 — Design System Version Bump 확인

> **단, C 트랙 (`@imjohnkoo/design-*` publish 정책) 결정 후 본 Phase 의미**. publish 안 함 결정 시 Phase 전체 스킵.

DS 패키지 변경이 있고 외부 consumer 에 영향 있으면 version bump 필수:

```bash
# DS 변경 여부
git diff origin/prod...HEAD --name-only \
  | grep -E "packages/design-(tokens|vue|mobile)/(src|components)"

# version bump 됐는지
git diff origin/prod...HEAD \
  packages/design-tokens/package.json \
  packages/design-vue/package.json \
  packages/design-mobile/package.json \
  | grep '"version"'
```

**판정**:
- DS src/components 변경 + version bump 없음 → 외부 consumer 영향 검토
  - 영향 있음 (API 변경, 신규 컴포넌트, 버그 수정) → version bump 후 재푸시
  - 내부 리팩터/주석만 → bump 불필요

### Phase 7 — Dev Sync 계획

> **현재 main 단독 운영 중이면 본 Phase NO-OP**. dev/prod 분리 후 활성.

**룰**: prod 에 push 할 때 dev/origin dev 도 반드시 동일 커밋으로 맞춤 (m8 패턴 차용).

```bash
# prod와 dev가 현재 어떻게 diverge됐는지
git log --graph --oneline origin/prod origin/dev | head -20

# Option A: dev를 prod로 fast-forward (권장, dev에 prod 외 커밋 없을 때)
# Option B: dev에 prod를 merge (dev에 별도 작업 있을 때)
```

**출력**:
```
Post-push dev sync plan:
  Current: dev is <N> commits behind prod
  Action:  git checkout dev && git pull && git merge --ff-only prod && git push origin dev
```

dev가 prod보다 앞서 있으면 **사용자에게 충돌 상황 보고**하고 수동 해결 요청.

### Phase 8 — CI/Deploy 확인

```bash
# 최근 prod deploy 상태 확인 (이전 푸시 성공 여부)
gh run list --branch prod --limit 5 --workflow "admin-production.yml"
gh run list --branch prod --limit 5 --workflow "client-production.yml"
```

**실패한 최근 run이 있으면**: 이전 배포가 불안정 — 사용자에게 확인.

## Final Report Template

```
nomacom-frontend prod push readiness check
==========================================

Working tree:
  ✓ Clean
  ✓ No secrets detected
  ✓ <N> unpushed commits

Paths-filter impact:
  ✓ admin   (reason: apps/admin/server/api/...)
  ✓ client  (reason: packages/design-vue/components/...)
  - mobile  (reason: 변경 없음)
  - DS publish: ✗ (정책 미정 / prod branch — publish는 main에서)

Build:        ✓ yarn turbo run build pass
Typecheck:    ✓ yarn turbo run typecheck pass
Tests:        ✓ nomacom-admin, nomacom-client
UI manual:    ✓ admin/client golden path 검증 완료
Migrations:   ✗ none
DDL:          ✗ none
DS bump:      ✗ N/A (publish 정책 미확정)

Dev sync plan:
  dev is 0 commits ahead of prod (또는 N/A — main 단독)
  Action: git checkout dev && git merge --ff-only prod && git push origin dev

Recent prod deploys: all green (last 5) / 또는 N/A (파이프라인 미구축)

READY to push. Proceed?
```

## Red Flags — Block Push

다음 중 하나라도 해당되면 **stop**:

- Working tree dirty
- Secrets/env 파일 variations committed (`.env.local`, `.env.production` 등)
- Build / Typecheck fail
- Test fail
- UI 변경인데 수동 검증 미완료
- Migration 있는데 backend / DB 소유자와 합의/적용 계획 없음
- DS API 변경인데 version bump 누락 (publish 정책 채택 시)
- Dev가 prod보다 앞서 있고 merge 전략 미정
- 최근 prod deploy 실패 히스토리
- **A 트랙 미완 상태에서 prod 푸시 시도** — 배포 인프라 자체가 없는데 푸시하면 GitHub Actions 트리거 0 → 사용자가 "성공" 으로 오인 위험

## Integration

**Called by:**
- `nomacomfe-finish-branch` (Option 1 이 prod 를 target 으로 할 때 자동)
- 사용자 직접 호출 (PR 머지 전)

**Calls:**
- `verification-before-completion` — 각 verification step 에서 증거 원칙 적용

**Related docs:**
- `.claude/rules/deployment.md` (CodeDeploy 흐름, path filter, 브랜치 전략 결정 가이드)
- `.claude/rules/ssm-paths.md` (SSM 경로 + secret naming)
- `apps/admin/CLAUDE.md` (dual DB 구조, 운영자 인증 미구현 등 — Phase 5 DB ownership 판단의 1차 소스)
- `apps/client/CLAUDE.md` (Maya API 흐름, Nuxt 4 server import 규칙 등)

## Gotchas

Claude 가 실제로 실수했거나 빠질 수 있는 덫:

- **`.env.example` 과 `.env.local` 구분 실패**: Phase 1.3 의 grep 패턴이 `.env.example` 도 잡을 수 있어 false positive. 명시적 `grep -v '\.env\.example$'` 적용
- **DS publish 정책 미확정**: C 트랙에서 (a) publish 안 함 결정 시 Phase 6 전체 스킵. 결정 후 본 skill 갱신
- **`--tolerate-republish` 함정** (publish 정책 채택 후): 같은 버전 republish 해도 CI 초록. "CI 초록 = 버전 올라간 것" 오판 금지. 실제 bump 는 `package.json` diff 로만 확인
- **Paths filter 에 없는 변경이 더 위험**: `turbo.json`, `tsconfig.base.json`, `.yarnrc.yml`, `apps/design-*/**` 은 workflow paths 필터에 없음 — 변경 시 **배포 안 되지만 로컬 dev 에서 깨질 수 있음**. PR 에 workflow paths 도 함께 수정해야 하는지 검토
- **dev sync 순서**: **prod push 먼저 → dev sync**. dev 먼저 push 하면 prod 뒤처져서 fast-forward 깨짐. Phase 7 명령 순서 절대 뒤집지 말 것
- **DB ownership 미확정**: m8 는 main DB 가 backend 소유라 admin/client 가 schema 변경 시 backend 합의 필수. nomacom 은 backend 가 별도 service 인지 admin server 자체에서 owns 인지 audit 필요. Phase 5 에서 이 구분 모호하면 보수적으로 "변경 보류 + 확인 요청"
- **prod push hook 차단**: `.claude/hooks/guard-prod-push.sh` 가 `git push *prod*` 차단. 본 skill 완료 후에도 사용자 명시 승인 필요
- **mobile 경로는 본 skill 범위 밖**: `apps/mobile/**` 변경은 Expo EAS / OTA 경로로 별도. CodeDeploy 파이프라인 (admin/client) 과 분리. mobile prod 배포는 EAS 채널 기준 별도 절차 필요
- **m8-frontend 자산을 nomacom 으로 잘못 참조**: 본 skill 의 일부 룰은 m8 패턴 차용 — 실제 nomacom 환경 (registry / EC2 / SSM 경로) 은 A 트랙 audit 결과로만 확정. 모호한 항목은 사용자에게 확인 후 실행
