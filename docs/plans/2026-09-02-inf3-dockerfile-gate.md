# INF-3 — Dockerfile 배포 게이트

> **Tier** `T1` (사용자 비노출 빌드·배포 인프라 — spec 면제) · **작성** 2026-09-02
> **PR base** `main` · **영향** `apps/{admin,client}/Dockerfile`
> **선행** INF-1 (`typecheck-gate.sh`) · INF-2 (`ci.yml`)
> **`.html`** 같은 basename 동반

---

## 1. 문제 — 배포 경로만 여전히 무검증이다

INF-1·INF-2 로 로컬과 PR/main 은 막았다. 그런데 **실제 배포가 지나가는 길에는 아무 검사도 없다.**

```
PR / main push   →  ci.yml (lint · test · typecheck)          ✅ INF-2
prod push        →  admin|client-production.yml               ⛔ 검사 0
                    → docker build (Dockerfile)               ⛔ 검사 0
                    → DockerHub push → CodeDeploy → EC2       ⛔ 검사 0
```

`prod` 브랜치에는 `ci.yml` 이 붙어 있지 않다(`branches: [main]`). 즉 `main` 을 거치지 않고 `prod` 로 직접 올리거나, `main` CI 실패를 무시하고 `prod` 로 머지하면 **깨진 코드가 그대로 이미지가 되어 EC2 까지 간다.**

현재 이 경로의 유일한 방어선은 사람이 부르는 `nomacomfe-prod-push-check` 와 guard 훅뿐이다 — 둘 다 **우회 가능**하다.

## 2. 기대 동작

`docker build` 가 **타입 에러가 있으면 이미지를 만들지 않는다.** 이미지가 없으면 push 도, CodeDeploy 도 실행되지 않는다 — 어떤 경로로 배포하든 판정된다.

## 3. 설계

### 3.1 게이트 위치 — builder 스테이지, `nuxt build` 직전

```dockerfile
COPY apps/client/ ./apps/client/
RUN yarn workspace nomacom-client run postinstall     # nuxt prepare
COPY .github/typecheck-baseline/client.txt ./.github/typecheck-baseline/
COPY .github/scripts/typecheck-gate.sh ./.github/scripts/
RUN bash .github/scripts/typecheck-gate.sh client     # ⬅ 게이트
RUN yarn workspace nomacom-client run build
```

- **`nuxt build` 앞**에 둔다 — 타입이 깨졌으면 비싼 빌드를 시작할 이유가 없다
- 게이트 스크립트가 내부에서 `nuxt prepare` 를 한 번 더 돌린다(Nuxt 4 tsconfig 특성). 중복이지만 ~1.4초라 감수
- baseline 파일도 함께 COPY — 기준선이 없으면 게이트가 exit 2 로 죽는다

### 3.2 왜 baseline 방식 그대로인가

Dockerfile 이라고 더 엄격하게(에러 0) 잡으면 **client 는 지금 당장 빌드가 안 된다**(기존 7건). CI 와 **같은 스크립트·같은 기준선**을 쓰는 것이 일관성 면에서도 옳다 — 로컬·CI·배포 세 곳의 판정이 같아야 "CI 는 통과했는데 배포에서 깨졌다"가 안 생긴다.

### 3.3 test 는 넣지 않는다

|           | 판단                                                                                                                                                          |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| typecheck | **넣는다** — 타입 에러는 런타임에 그대로 터진다                                                                                                               |
| test      | **넣지 않는다** — client 28건은 `ci.yml` 이 이미 돌린다. Dockerfile 에 넣으면 배포 시간만 늘고, 실패 시점이 «prod ref 가 이미 옮겨진 뒤» 라 드리프트가 남는다 |

m8 은 admin test 를 Dockerfile 에 넣었지만, 그건 m8 admin 이 CI 도입 전이던 시절의 잔재다. nomacom 은 INF-2 로 CI 가 먼저 있으므로 중복을 만들 이유가 없다.

### 3.4 build context 주의

`.dockerignore` 가 `.github/` 를 제외하고 있으면 COPY 가 실패한다 — **선확인 필요**.

## 4. 파일 계획

| 파일                     | 변경                                   |
| ------------------------ | -------------------------------------- |
| `apps/admin/Dockerfile`  | postinstall 뒤 · build 앞에 게이트 3줄 |
| `apps/client/Dockerfile` | 동일                                   |
| `.dockerignore`          | `.github/` 가 제외돼 있으면 예외 추가  |

## 5. 테스트 계획

| 검증 대상                            | 방법                                                                 |
| ------------------------------------ | -------------------------------------------------------------------- |
| 게이트가 실제로 이미지 빌드를 막는다 | 인위적 타입 에러 주입 → `docker build` 실패 확인 → 제거 후 성공 확인 |
| 정상 상태에서 빌드 성공              | `docker build -f apps/{admin,client}/Dockerfile .` 양쪽              |
| 빌드 시간 증가폭                     | 게이트 전/후 측정 — 허용 범위인지 판단                               |
| CI 무회귀                            | `ci.yml` green 유지                                                  |

**회귀 범위**: 배포 파이프라인 전체. 게이트가 오작동하면 **정상 코드도 배포가 막힌다** — 인위적 에러 테스트로 양방향(막힘/통과) 모두 확인해야 한다.

## 6. 태스크 분해

- **[T1]** `.dockerignore` 확인 + Dockerfile 2개에 게이트 삽입 — ~20 LOC
- **[T2]** 로컬 `docker build` 로 양방향 검증 (정상 통과 / 에러 주입 시 차단) — 코드 변경 없음
- **[T3]** 문서 — CLAUDE.md·dev-process.md·prod-push-check 에서 "배포 경로 무검증" 서술 갱신 · weekly INF-3 완료 — ~40 LOC

## 7. 게이트 (머지 전)

- [ ] `docker build` 가 admin·client 양쪽 성공
- [ ] 인위적 타입 에러 주입 시 **이미지가 만들어지지 않음**을 확인 (출력 원문)
- [ ] `ci.yml` green 유지
- [ ] 문서에서 "배포 경로 기계 검증 0" 서술 제거

## 8. 비범위

- `prod` 브랜치에 `ci.yml` 붙이기 — 배포 트리거와 CI 가 같은 push 에서 경쟁하면 순서 보장이 안 된다. Dockerfile 게이트가 더 확실한 지점
- test 를 Dockerfile 에 추가 (§3.3)
- INF-4 (admin staging) · INF-5 (storybook)
- 배포 시간 최적화 (레이어 캐시 튜닝)

## 9. as-built (2026-09-02 완료)

### 계획 대비 이탈

없음. 설계대로 들어갔다. `.dockerignore` 가 `.github/` 를 막지 않아 예외 추가도 불필요했다(§4 의 조건부 항목 미발생).

### 검증 (증거)

**양방향 확인 — 통과와 차단을 모두 실측했다.** 게이트는 «막는 것» 이 존재 이유이므로 통과만 확인하면 검증이 아니다.

| 시나리오 | 결과 |
| --- | --- |
| client 정상 빌드 | ✅ 이미지 생성 (`naming to docker.io/library/nomacom-client:gate-test done`) · 총 3분 34초 |
| client + **인위적 타입 에러 주입** | ⛔ `docker build exit=1` — **이미지 미생성** |
| admin 정상 빌드 | ✅ `typecheck-gate: admin — baseline 0 / current 0 (신규 0)` → 이미지 생성 |

차단 시 실제 출력:

```
#26 5.593 typecheck-gate: client — baseline 7 / current 8 (신규 1 · 해소 0)
#26 5.593 ⛔ 기준선에 없던 신규 타입 에러 1 건:
#26 5.594     server/utils/__gate_probe__.ts(2,14): error TS2322
#26 ERROR: process "/bin/sh -c bash .github/scripts/typecheck-gate.sh client"
          did not complete successfully: exit code: 1
```

`docker images` 로 `gate-fail` 태그가 **생성되지 않았음**을 확인 — 이미지가 없으면 push 도 CodeDeploy 도 실행되지 않는다.

### 비용

게이트 자체는 **~5.6초** (nuxt prepare 포함). 전체 빌드 3분 34초 대비 무시할 수준이다.

### 검증 3층이 완성됐다

| 층 | 지점 | 도입 |
| --- | --- | --- |
| 로컬 | `yarn turbo run typecheck` | INF-1 |
| PR / main | `.github/workflows/ci.yml` | INF-2 |
| **배포** | `apps/{admin,client}/Dockerfile` | **INF-3** |

세 곳이 **같은 스크립트(`typecheck-gate.sh`) · 같은 기준선**(admin 0 / client 7)을 쓴다. 판정이 갈리지 않으므로 "CI 는 통과했는데 배포에서 깨졌다" 가 구조적으로 생기지 않는다.

### 남은 갭 — 게이트가 보지 않는 것

⚠️ **게이트는 «타입» 만 본다. 동작이 맞는지는 여전히 아무도 안 본다.**

- test 는 Dockerfile 에 넣지 않았다(§3.3) — `ci.yml` 이 담당
- admin 은 테스트가 0건이고, client 28건도 순수 유닛이다
- 따라서 `nomacomfe-prod-push-check` 의 **UI 수동 검증이 유일한 기능 검증**이라는 사실은 변하지 않았다

### 후속

- **INF-4** admin staging (prod 가 첫 통합 환경 — 구조적 갭)
- **INF-5** `design-storybook-mobile` 빌드 파손
