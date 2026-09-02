# INF-1 — admin/client 검증 러너 부트스트랩

> **Tier** `T1` (다중 파일이지만 사용자 비노출 내부 빌드 변경 — spec 면제 조건 해당) · **작성** 2026-09-02
> **PR base** `main` · **영향 앱** admin · client (+ root turbo)
> **배경 트랙** 프로세스 v2 이식의 Phase 3 인프라 (weekly 기술 부채 INF-1)
> **`.html`** 같은 basename 동반 — 둘 중 하나만 고치지 않는다

---

## 1. 문제

`turbo run typecheck` / `turbo run test` 가 **admin/client 에서 no-op** 이다 — 두 앱에 해당 script 자체가 없다. 결과:

- `nomacomfe-finish-branch` Step 1 과 `nomacomfe-prod-push-check` 가 "빌드·타입·테스트 검증" 을 표방하지만 **실제로는 build 만** 돈다
- T1 회귀 증거가 구조적으로 "테스트 불가 사유" 로만 쌓인다 (`nomacomfe-write-plan` 테스트 환경 제약)
- 배포 경로에도 기계 검증이 없다 (Dockerfile 게이트 부재 — INF-3)

## 2. 기대 동작

```bash
yarn turbo run typecheck    # admin·client·design-vue·mobile 전부 실제로 검사
yarn turbo run test         # 실제로 테스트 실행
yarn turbo run lint         # 실제로 린트
```

각 앱에서 **신규 타입 에러가 들어오면 실패**한다. 단 기존 에러를 전부 고치는 것은 이번 범위가 아니다.

## 3. 실측 (2026-09-02, `vue-tsc --noEmit -p .nuxt/tsconfig.json`)

| 앱                      | 자체 코드 에러               | node_modules 에러                             |
| ----------------------- | ---------------------------- | --------------------------------------------- |
| `nomacom-admin`         | **0**                        | 0                                             |
| `nomacom-client`        | **7**                        | 15 (전부 `qrcode-vue3` 가 src 를 직접 export) |
| `@imjohnkoo/design-vue` | (vitest 129 tests green)     | —                                             |
| `nomacom-mobile`        | 0 (`tsc --noEmit` 이미 존재) | —                                             |

client 자체 7건 (전부 `possibly undefined` 계열 — 잠재 버그일 수 있어 별도 트랙에서 다룬다):

- `app/pages/details/[orderId].vue` 145, 147
- `app/pages/select-date/[orderId].vue` 170
- `server/utils/spark-error-codes.ts` 32
- `server/utils/spark-issuance.ts` 140, 283, 336

## 4. 설계 — baseline 게이트 (m8 패턴 차용)

기존 에러를 강제로 고치게 만들면 이 트랙이 끝나지 않는다. **기준선에 «없던» 신규 에러만 차단**한다.

```
.github/typecheck-baseline/admin.txt     ← 0줄
.github/typecheck-baseline/client.txt    ← 7줄 (정규화된 "파일(줄,열): 코드" 형태)
.github/scripts/typecheck-gate.sh <app>  ← 실행 → 정규화 → baseline 과 diff → 신규분만 실패
```

- **node_modules 에러는 판정에서 제외** — 우리가 고칠 수 없고 의존성 버전에 따라 흔들린다
- baseline 갱신은 에러를 **고쳤을 때만** (줄어드는 방향). 늘리려면 사용자 승인
- 스크립트에 회귀 테스트 동봉 (`typecheck-gate.test.sh`)

## 5. 파일 계획

| 파일                                            | 변경                                                              |
| ----------------------------------------------- | ----------------------------------------------------------------- |
| `apps/admin/package.json`                       | `typecheck` · `test` · `lint` script 추가                         |
| `apps/client/package.json`                      | 동일 (vitest 는 이미 devDep 에 있음)                              |
| `apps/admin/vitest.config.ts`                   | 신규 — 순수 유닛만 (환경 의존 배제)                               |
| `apps/client/vitest.config.ts`                  | 신규 — 동일. `.env.local`·로컬 PG 의존 테스트는 include 에서 제외 |
| `apps/{admin,client}/server/utils/__tests__/`   | 스모크 테스트 1건씩 — 러너가 실제로 도는지 증명                   |
| `.github/scripts/typecheck-gate.sh`             | 신규 — baseline 비교 게이트                                       |
| `.github/scripts/typecheck-gate.test.sh`        | 신규 — 게이트 회귀 테스트                                         |
| `.github/typecheck-baseline/{admin,client}.txt` | 신규 — 기준선                                                     |
| `package.json` (root)                           | `typecheck:gate` 편의 script                                      |

## 6. 테스트 계획

| 검증 대상                            | 레벨             | 방법                                                               |
| ------------------------------------ | ---------------- | ------------------------------------------------------------------ |
| script 가 실제로 돈다                | 수동 + 출력 원문 | `yarn turbo run typecheck` / `test` / `lint` 결과 첨부             |
| baseline 게이트가 신규 에러를 잡는다 | 회귀 테스트      | `typecheck-gate.test.sh` — 인위적 에러 주입 시 실패, 기준선은 통과 |
| 기존 통과 자산이 안 깨진다           | 회귀             | design-vue 129 tests · admin/client build · mobile typecheck       |

**회귀 범위**: turbo 파이프라인 전체(`typecheck`/`test`/`lint` task 가 처음으로 실체를 갖는다) · CI 는 아직 없으므로 로컬 실행이 유일 게이트

## 7. 태스크 분해

- **[T1]** admin/client `package.json` script + vitest 설정 + 스모크 테스트 — ~120 LOC
- **[T2]** `typecheck-gate.sh` + baseline 생성 + 게이트 회귀 테스트 — ~180 LOC
- **[T3]** 문서 반영 — `.claude/rules/dev-process.md` 환경 제약 표 갱신 · `nomacomfe-write-plan` 테스트 환경 제약 절 갱신 · `nomacomfe-finish-branch`/`prod-push-check` 의 "no-op" 경고 제거 · weekly INF-1 완료 — ~60 LOC

## 8. 게이트 (머지 전)

- [ ] `yarn turbo run build` (admin+client) green
- [ ] `yarn turbo run typecheck` 가 **실제로 4개 workspace 를 검사**하고 baseline 내에서 green
- [ ] `yarn turbo run test` 가 실제로 실행 (design-vue 129 + admin/client 스모크)
- [ ] `typecheck-gate.test.sh` green
- [ ] 문서에서 "typecheck/test 는 no-op" 서술이 사라짐 (grep 확인)

## 9. 비범위 (Non-goals)

- **client 자체 에러 7건 수정** — 별도 트랙. `possibly undefined` 는 실제 런타임 분기 검토가 필요해 이 트랙에서 급히 고치면 회귀 위험
- **CI 워크플로 추가** (INF-2) · **Dockerfile 게이트** (INF-3) — 후속
- E2E / Playwright 도입
- `qrcode-vue3` 타입 에러 해결 (upstream 문제)

## 10. as-built (2026-09-02 완료)

### 계획 대비 이탈

1. **client 에는 이미 테스트 28건이 있었다** (`server/utils/spark-mapping.test.ts`, `verification.test.ts`). script 가 없어 **한 번도 실행되지 않고 있었을 뿐**이다. 따라서 "스모크 테스트 신규 작성" 태스크는 불필요해졌고, vitest `include` 패턴을 실제 배치(`server/**/*.test.ts`)에 맞추는 것으로 대체했다.
2. **admin 스모크 테스트는 만들지 않았다.** admin 은 `server/api/health.get.ts` 뿐인 «깡통화» 상태라 억지 테스트는 의미가 없다. `passWithNoTests: true` + include 는 열어 두어, 도메인 로직이 들어오는 순간 자동으로 잡히게 했다. client 는 반대로 `false` (28건이 사라지면 실패해야 한다).
3. **게이트 회귀 테스트가 실제 결함을 잡았다.** 최초 구현은 `.nuxt/tsconfig.json` 이 있으면 `nuxt prepare` 를 건너뛰었는데, Nuxt 4 는 tsconfig 를 app/node/server/shared 4개로 쪼개고 **파일 목록을 고정 기록**한다. 그래서 **새로 추가된 파일이 타입체크에서 통째로 빠졌다** — 게이트의 존재 이유를 무너뜨리는 오작동. 항상 prepare 하도록 수정(비용 ~1.4초).
4. **lint 범위가 예상보다 컸다.** client 58 errors 중 **56건이 `no-undef`** — Nuxt 자동 import(`ref`·`onMounted`)를 eslint 가 모르는 설정 결함이었다. typescript-eslint 공식 권장대로 TS/Vue 파일에서 `no-undef` 를 끄고(타입 검사는 typecheck 게이트 담당), 남은 실제 에러 2건은 수정.
5. **design-vue 에서 실제 버그 1건 발견.** `NPopover` 가 `defineProps` 와 `defineModel` 로 `open` 을 **이중 선언**하고 있었다(`vue/no-dupe-keys`). 외부 API 는 그대로 두고 중복만 제거. 그 외 미사용 import·빈 interface 4건 정리.
6. **`typecheck` script 는 게이트를 거치게 했다.** 원본 vue-tsc 는 `typecheck:raw` 로 남겼다.

### 최종 상태

| 항목            | before                     | after                                                              |
| --------------- | -------------------------- | ------------------------------------------------------------------ |
| `turbo run test`      | no-op (0건 실행)     | **157건** (design-vue 129 + client 28)                             |
| `turbo run typecheck` | no-op                | admin·client 게이트 통과 + design-tokens/vue + mobile — **5 workspace** |
| `turbo run lint`      | no-op                | **에러 0** (client 288 warn / design-vue 813 warn 은 통과)          |
| 타입 에러 기준선      | 없음                 | admin 0 / client 7 (`.github/typecheck-baseline/`)                 |
| 게이트 회귀 테스트    | 없음                 | **7/7 green** (`typecheck-gate.test.sh`)                            |

### 검증 (증거)

```
yarn turbo run lint typecheck test build --force
  → Tasks: 22 successful, 22 total
  → design-vue: 17 files / 129 tests passed
  → client:      2 files /  28 tests passed
  → typecheck-gate: admin 0/0 · client 7/7 → 신규 0
  → lint: 0 errors (warnings only)
.github/scripts/typecheck-gate.test.sh → pass=7 fail=0
```

### 남은 것 (비범위 유지)

- client 자체 타입 에러 7건 — 전부 `possibly undefined`. 런타임 분기 검토가 필요해 별도 트랙
- **INF-2** PR/main CI · **INF-3** Dockerfile 게이트 · **INF-4** admin staging
- warning 정리 (client 288 / design-vue 813) — 대부분 vue 포맷팅. prettier 훅과 역할이 겹쳐 우선순위 낮음
