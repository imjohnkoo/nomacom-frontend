---
name: nomacomfe-finish-branch
description: Complete nomacom-frontend worktree work — verify Turbo build/tests, present merge/PR options, sync prod↔dev when pushing to prod, clean up worktree. Use when implementation is done and you need to integrate the work. Respects the project rule that prod push requires dev sync.
---

# nomacom-frontend Finish Branch

Guide completion of worktree development. Verify → options → execute → cleanup.

**Announce at start:** "I'm using the nomacomfe-finish-branch skill to complete this work."

> **현 상태 주의 (2026-05)**: nomacom-frontend 는 prod 배포 파이프라인 자체가 아직 부트스트랩 중 (A 트랙). `main` 단독 운영 시점에는 Step 2 의 base branch 가 항상 `main`, Step 4.5 (prod↔dev sync) NO-OP. A 트랙 완료 + 브랜치 전략 확정 후 본 skill 본격 의미.

## Core Principles

- **Verify before offering options** — no broken code gets merged
- **Respect the prod↔dev rule** — prod push MUST sync dev (브랜치 분리 후 적용)
- **Paths-filter awareness** — changes to `packages/design-tokens/**` or `packages/design-vue/**` trigger BOTH admin + client deploys; `packages/design-mobile/**` 는 mobile 전용
- **Worktree cleanup** — keep `~/dev/worktrees/nomacom-frontend/` tidy

## Process

### Step 1: Verify Build + Affected Apps

Detect changed apps and only build/test what's affected (Turbo handles incremental).

```bash
# a. 어떤 파일이 바뀌었는지
git diff --name-only $(git merge-base HEAD main)...HEAD

# b. 영향 앱 판정 (GitHub Actions paths-filter와 동일 룰)
#    - packages/design-tokens/** → admin + client (DS 리빌드 후 두 앱 재빌드)
#    - packages/design-vue/**    → admin + client
#    - packages/design-mobile/** → mobile only
#    - apps/admin/**             → admin only
#    - apps/client/**            → client only
#    - apps/mobile/**            → mobile only (Expo EAS / OTA, 별도 파이프라인)
#    - root (package.json, yarn.lock, turbo.json, tsconfig.base.json) → admin + client
#    - deploy/**, appspec.yml, .github/workflows/** → 인프라 변경, admin + client
```

Then:

```bash
# 빌드 (Turbo가 dependsOn:^build로 DS → 앱 순서 자동 보장)
yarn turbo run build --filter=nomacom-admin --filter=nomacom-client || exit 1
# 또는 영향 앱만:
# yarn turbo run build --filter=nomacom-admin

# 타입체크 + 테스트 (있는 경우)
yarn turbo run typecheck --filter=nomacom-admin --filter=nomacom-client || exit 1
yarn turbo run test --filter=nomacom-admin --filter=nomacom-client
```

**If build/tests fail**: Stop. Show failures. Don't proceed.

> **mobile 변경 시**: `nomacom-mobile` 은 `tsc --noEmit` + Expo prebuild 로 검증. `yarn workspace nomacom-mobile run typecheck` (있으면) 또는 `yarn workspace nomacom-mobile run start` 로 dev server 부팅 확인. prod 배포는 EAS Build / Submit 별도.

### Step 2: Determine Base Branch

```bash
# 가장 최근 공통 조상으로 판정
git merge-base HEAD main 2>/dev/null && BASE=main
git merge-base HEAD dev 2>/dev/null && BASE=${BASE:-dev}
git merge-base HEAD prod 2>/dev/null && BASE=${BASE:-prod}
```

사용자에게 확인: "Base branch로 `<base>`를 사용할까요?"

> **현재 main 단독**: dev/prod 분리 전에는 항상 main. 사용자가 임시 브랜치 만들고 main 으로 PR 만드는 흐름.

### Step 3: Present Options

```
Implementation complete. What would you like to do?

1. Merge locally to <base>  (then optionally sync to prod)
2. Push and create PR to <base>
3. Push branch as-is (keep open, I'll handle manually)
4. Discard this work

Which option?
```

### Step 4: Execute Choice

#### Option 1: Merge Locally to `<base>`

```bash
# worktree에서 직접 base 전환 안 됨 (다른 worktree에서 쓰면)
# → 메인 클론으로 이동
cd ~/dev/current-projects/nomacom-frontend
git fetch origin
git checkout <base>
git pull --ff-only
git merge --no-ff <feature-branch>

# 빌드 재확인 (Turbo 캐시 활용)
yarn install && yarn turbo run build

# push
git push origin <base>
```

**⚠️ If `<base>` is `prod`**: Step 4.5(prod↔dev sync) 반드시 실행.

Then: Step 5 (cleanup worktree).

#### Option 2: Push + PR

```bash
cd <worktree>
git push -u origin <feature-branch>

gh pr create --base <base> --title "<type>(<scope>): <title>" --body "$(cat <<'EOF'
## Summary
<2-3 bullets>

## Affected apps
- [ ] admin (apps/admin)
- [ ] client (apps/client)
- [ ] mobile (apps/mobile)
- [ ] design-tokens (packages/design-tokens)
- [ ] design-vue (packages/design-vue)
- [ ] design-mobile (packages/design-mobile)

## Test Plan
- [ ] yarn turbo run build
- [ ] yarn turbo run typecheck
- [ ] yarn turbo run test
- [ ] UI 수동 검증 (admin/client dev 서버 띄워서 golden path)
- [ ] mobile 변경 시: Expo dev server 부팅 + Universal Link 시뮬레이션 (해당 시)

## Deploy impact (paths filter)
- Changed: apps/<...>/**, packages/design-*/**, ...
- Triggered workflows:
  - [ ] admin-production.yml
  - [ ] client-production.yml
  - [ ] (mobile EAS — 별도 채널)

## DS version bump (publish 정책 채택 시 적용)
- [ ] packages/design-tokens/package.json `version` 올림
- [ ] packages/design-vue/package.json `version` 올림
- [ ] packages/design-mobile/package.json `version` 올림
- [ ] 외부 consumer 영향 명시
EOF
)"
```

PR 타이틀은 `feat(admin): ...`, `fix(client): ...`, `feat(design-vue): ...`, `feat(mobile): ...` 등 scope 를 앱/패키지로 표기.

**Keep worktree** (PR review 중 수정 가능하도록). Step 5는 스킵.

#### Option 3: Push As-Is

```bash
git push -u origin <feature-branch>
```

브랜치만 push. Worktree 유지.

#### Option 4: Discard

**확인 프롬프트**:
```
This will permanently delete:
- Branch:   <feature-branch>
- Commits:  <count> commits
- Worktree: ~/dev/worktrees/nomacom-frontend/<name>

Type 'discard' to confirm.
```

확인 후:
```bash
cd ~/dev/current-projects/nomacom-frontend
git branch -D <feature-branch>
# worktree 정리는 Step 5
```

### Step 4.5: prod↔dev 동기화 (Option 1에서 `<base>` == `prod`인 경우)

> **본 step 은 브랜치 분리 후에만 적용**. 현재 main 단독이면 NO-OP.

**룰**: prod 에 push 할 때 dev/origin dev 도 반드시 동일 커밋으로 맞춤 (m8 패턴 차용).

```bash
cd ~/dev/current-projects/nomacom-frontend

# dev를 prod와 같게
git checkout dev
git fetch origin
git pull --ff-only
git merge --ff-only prod   # fast-forward만 허용
git push origin dev

echo "✓ dev synced to prod"
```

**fast-forward가 안 되면**: dev가 prod보다 앞서 있는 상황 — 사용자에게 보고하고 수동 해결 요청.

### Step 5: Cleanup Worktree

Option 1, 4에 한해 자동 정리:

```bash
cd ~/dev/current-projects/nomacom-frontend
git worktree remove ~/dev/worktrees/nomacom-frontend/<name>
# 실패 시 force
# git worktree remove --force ~/dev/worktrees/nomacom-frontend/<name>
```

Option 2, 3에는 worktree 유지.

## Decision Table

| Option | Build/Test | Base push | prod↔dev sync | Keep worktree |
|---|---|---|---|---|
| 1. Merge locally | ✓ | ✓ | ✓ (if base=prod) | ✗ |
| 2. Push + PR | ✓ | — (PR) | — (merge 시 별도) | ✓ |
| 3. Push as-is | ✓ | ✗ | ✗ | ✓ |
| 4. Discard | ✗ | ✗ | ✗ | ✗ |

## Red Flags

**절대 하지 말 것**:
- 빌드/타입체크 실패 상태로 Option 1~3 진행
- prod 에 push 하면서 dev sync 스킵 (브랜치 분리 후)
- `--force` push to prod/main/dev
- `--no-verify` commit/push
- fast-forward 아닌 force merge
- DS 패키지 버전 올리지 않고 외부 consumer 에 영향 있는 변경 publish (publish 정책 채택 후)

**반드시**:
- Base branch 명시적 확인
- 영향 앱 파악 (paths-filter): DS tokens/vue 변경은 admin+client 둘 다, design-mobile 변경은 mobile
- Worktree cleanup 은 Option 1, 4 에서만
- DS 변경 시 외부 consumer 영향 검토 (C 트랙 publish 정책 채택 시)
- mobile 변경은 별도 EAS 채널이라는 점 명시

## Integration

**Pairs with:**
- `nomacomfe-prod-push-check` — prod push 전 pre-flight 체크
- `verification-before-completion` — Step 1 전에 증거 수집

**Related:**
- `.claude/rules/deployment.md` — CodeDeploy 배포 흐름, path filter, 브랜치 전략 결정 가이드
- `.claude/rules/ssm-paths.md` — SSM 경로 / secret naming (audit 진행 중)

## Gotchas

Claude 가 실제로 실수했거나 빠질 수 있는 덫:

- **Worktree 에서 `git checkout <base>` 금지**: 해당 base 브랜치가 메인 클론에서 이미 체크아웃되어 있으면 worktree 에서 체크아웃 실패. Option 1 은 반드시 `cd ~/dev/current-projects/nomacom-frontend` (메인 클론) 로 이동 후 진행
- **Base branch 우선순위 — prod 아님**: Step 2 의 `|| ${BASE:-...}` 조합 때문에 세 브랜치 모두에 merge-base 가 있으면 `main` 이 우선 잡힘. 실제 의도가 `dev` 나 `prod` 이면 **사용자 확인 필수** (자동 채택 금지)
- **`git worktree remove` 가 조용히 실패**: uncommitted 파일 또는 worktree 내 실행 중인 프로세스(dev server)가 있으면 실패. `--force` 쓰기 전에 원인 확인 — 잃을 작업이 있을 수 있음
- **DS 변경 = 두 앱 재빌드**: `packages/design-tokens/**` 또는 `packages/design-vue/**` 만 바꿔도 admin + client **둘 다** 재배포 트리거. `packages/design-mobile/**` 은 mobile 전용. PR description Affected apps 체크박스 누락하지 말 것
- **Option 2 의 base=`main`** (publish 정책 채택 후): main 으로 PR merge 되면 `design-system-publish.yml` 이 트리거 — DS 패키지 변경 포함되어 있으면 version bump 선행 필수. 아니면 `--tolerate-republish` 로 no-op 되지만 외부 consumer 가 업데이트 안 받음
- **prod push hook 차단**: `.claude/hooks/guard-prod-push.sh` 가 `git push *prod*` 차단. Option 1 + base=prod 경로에서 사용자 명시 승인 없으면 push 실패
- **fast-forward 강제**: Step 4.5 의 `git merge --ff-only prod` 는 의도적. fast-forward 안 되면 (dev 가 앞섬) 자동 해결 시도 금지 — 사용자에게 보고
- **mobile 의 EAS 배포는 본 skill 범위 밖**: `apps/mobile/**` 변경은 `eas build` + `eas submit` 또는 OTA `eas update` 별도. CodeDeploy 흐름과 분리. 추후 별도 skill 도입 가능
- **A 트랙 미완 상태에서 prod merge**: 현재 nomacom-frontend prod 파이프라인 미구축 — prod 브랜치 만들고 merge 해도 배포 안 일어남. Option 1 + base=prod 선택 시 "파이프라인 미구축" 경고 + A 트랙 완료 확인 요청
