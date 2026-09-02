# INF-2 — PR/main CI 게이트

> **Tier** `T1` (사용자 비노출 CI·빌드 인프라 — spec 면제) · **작성** 2026-09-02
> **PR base** `main` · **영향** `.github/`, 전 workspace lint 설정
> **선행** INF-1 (검증 러너 부트스트랩, `e2e362e`)
> **`.html`** 같은 basename 동반

---

## 1. 문제

INF-1 로 **로컬** 게이트는 생겼지만 **CI 는 여전히 0건**이다.

- `.github/workflows/` 에는 배포 workflow 3개(prod 트리거 2 + DS publish 1)뿐 — **PR 과 main push 를 검사하는 것이 하나도 없다**
- 즉 로컬에서 `turbo run lint typecheck test` 를 돌리지 않고 push 하면 **아무도 안 잡는다**. 사람 규율이 유일한 게이트
- 배포 경로(Dockerfile)에도 게이트가 없으므로(INF-3 미착수), 깨진 코드가 prod 이미지까지 그대로 간다

## 2. 기대 동작

- **PR 열림/갱신** 또는 **main push** 시 CI 가 자동으로: lint → typecheck(게이트) → test 를 돌린다
- 실패하면 PR 에 빨간 체크가 뜬다
- 같은 ref 에 새 push 가 오면 앞의 실행을 취소한다 (CI 는 배포와 달리 취소해도 안전)

## 3. 실측 — 켜기 전에 막힐 것들 (2026-09-02)

CI 를 그냥 켜면 **바로 빨간불**이 된다. 원인 3종:

| 워크스페이스               | 상태                                                                                                |
| -------------------------- | --------------------------------------------------------------------------------------------------- |
| `@imjohnkoo/design-mobile` | `lint` 가 **`echo 'lint placeholder'`** — 가짜다. 실제로 돌리면 에러 4건                            |
| `apps/mobile`              | `lint` script **없음**. 실제로 돌리면 에러 4건                                                      |
| 공통                       | `react-hooks/exhaustive-deps` **룰 정의 없음** 4건 — 코드에 disable 주석이 있는데 플러그인이 미설치 |

에러 상세:

- `no-unused-vars` 3건 — design-mobile 의 미사용 타입 import (`ViewStyle`·`TextStyle`)
- `react-hooks/exhaustive-deps` 4건 — 플러그인 부재로 "Definition for rule not found"
- `no-undef 'module'` 1건 — `apps/mobile/babel.config.js` 가 CommonJS 인데 node 전역을 모름

> **"lint placeholder" 를 그대로 두고 CI 를 켜면 CI 가 «lint 통과» 라고 거짓 보고한다.** INF-1 에서 `turbo run test` no-op 을 고친 것과 같은 종류의 문제이므로 이번에 함께 해소한다.

## 4. 설계

### 4.1 lint 는 baseline 을 만들지 않는다

INF-1 의 typecheck 는 client 7건이 이미 있어 baseline 이 불가피했다. **lint 는 지금 에러 0 을 달성할 수 있으므로 기준선을 만들지 않는다** — 기준선을 만드는 순간 부채가 쌓일 자리가 생긴다. (m8 이 신규 워크스페이스 `admin-mcp` 에 대해 같은 판단을 했다.)

### 4.2 job 2개로 쪼갠다

| job    | 내용                                                             | 이유                                          |
| ------ | ---------------------------------------------------------------- | --------------------------------------------- |
| `lint` | 전 workspace eslint                                              | 수 초 — 빨리 깨지는 것부터 별도 job 으로 병렬 |
| `gate` | DS 빌드 → DS typecheck/test → 앱 prepare → test → typecheck gate | 순서 의존이 있어 한 job 안에서 순차           |

### 4.3 순서 규칙 (뒤집지 말 것)

1. **corepack 을 setup-node 앞에** — `cache: yarn` 이 setup-node 시점에 `yarn` 을 호출하므로
2. **`yarn install --immutable --mode=skip-build`** — 앱 postinstall(`nuxt prepare`)이 `@imjohnkoo/design-vue` 빌드 산출물을 요구하므로, install 시점에는 돌리지 않는다
3. **DS 빌드 → 앱 prepare** — 이 순서라야 `.nuxt` 타입이 만들어진다
4. **test 를 typecheck 앞에** — test 는 수 초, typecheck 는 수십 초. 빨리 깨질 수 있는 것부터

## 5. 파일 계획

| 파일                                       | 변경                                                     |
| ------------------------------------------ | -------------------------------------------------------- |
| `.github/workflows/ci.yml`                 | 신규 — PR + main push 게이트                             |
| `package.json` (root)                      | `eslint-plugin-react-hooks` devDep 추가                  |
| `eslint.config.js`                         | react-hooks 플러그인 등록 + `*.config.js` node 전역 허용 |
| `packages/design-mobile/package.json`      | `lint` placeholder → 실제 eslint · `typecheck` 추가      |
| `apps/mobile/package.json`                 | `lint` script 추가                                       |
| `packages/design-mobile/src/components/**` | 미사용 import 3건 제거                                   |

## 6. 테스트 계획

| 검증 대상                    | 방법                                                                          |
| ---------------------------- | ----------------------------------------------------------------------------- |
| 전 workspace lint 에러 0     | `yarn turbo run lint` 출력 원문                                               |
| CI 문법 정합                 | `gh workflow view` 또는 실제 PR 로 1회 실행 — **실행 로그가 유일한 증거**     |
| 기존 자산 무회귀             | `turbo run lint typecheck test build` 22/22 유지 · 게이트 회귀 7/7 · 훅 37/37 |
| react-hooks 룰이 실제로 동작 | disable 주석이 있는 파일에서 "rule not found" 가 사라짐                       |

**회귀 범위**: eslint 설정은 전 workspace 에 영향 — design-vue(813 warn)·client(288 warn) 의 경고 수가 급변하면 설정 사고 신호

## 7. 태스크 분해

- **[T1]** lint 실체화 — react-hooks 플러그인 + config + placeholder 제거 + 에러 8건 수정 — ~80 LOC
- **[T2]** `ci.yml` 작성 — ~120 LOC
- **[T3]** 문서 — CLAUDE.md/dev-process.md 의 "CI 0건" 서술 갱신 · weekly INF-2 완료 — ~40 LOC

## 8. 게이트 (머지 전)

- [ ] `yarn turbo run lint` — **전 workspace 에러 0** (placeholder 없음)
- [ ] `yarn turbo run lint typecheck test build` 전항 green
- [ ] `ci.yml` 이 실제 실행돼 green (증거 = run URL)
- [ ] 문서에서 "CI 게이트 0건" 서술 제거

## 9. 비범위

- **Dockerfile 게이트 (INF-3)** — 별도
- client 타입 에러 7건 · warning 정리 (design-vue 813 / client 288)
- E2E / Playwright
- CI 에서 `docker build` 검증 — 시간 비용이 크고 배포 workflow 가 이미 함

## 10. as-built (2026-09-02 완료)

### 계획 대비 이탈

1. **워크플로 전체를 turbo 명령으로 통일했다.** 처음엔 m8 판을 따라 `yarn workspace <name> run typecheck` 를 썼는데, 그러면 해당 워크스페이스의 `node_modules/.bin` 만 보므로 hoist 된 `tsc`·`eslint` 를 못 찾아 `command not found` 로 죽는다 (design-vue·design-mobile·mobile 전부). turbo 는 루트 `.bin` 을 PATH 에 넣는다.
2. **명시적 `Build design system` / `Prepare apps` 스텝을 없앴다.** turbo 의 `dependsOn`(`^build`)과 `typecheck-gate.sh` 내부의 `nuxt prepare` 가 이미 그 일을 한다 — 중복이었다.
3. **CI 첫 실행이 실패했고, 그 실패가 실제 결함을 드러냈다** (run 33598854175, gate fail / lint pass):
   - `turbo run test` 는 `dependsOn: ["build"]` 라 필터 없이 돌리면 **테스트가 없는 데모 워크스페이스의 build 까지** 끌고 온다
   - 그중 `design-storybook-mobile` 이 `--mode=skip-build` 설치 환경에서 `@storybook/react-vite/preset` 을 못 찾아 죽었다
   - ⚠️ **로컬에서는 같은 에러를 내면서도 exit 0** 이라 조용히 지나갔다. clean install 환경에서만 드러나는 종류의 결함이다
   - → test·typecheck 를 `--filter` 로 좁히고, storybook 부채는 weekly **INF-5** 로 기록
4. **guard 훅 회귀 테스트도 CI 에 넣었다.** 계획엔 없었지만 판정 로직이 깨지면 prod 차단이 조용히 사라진다 — 게이트 스크립트 테스트와 같은 이유.
5. **시크릿 사고가 끼어들었다** (계획 밖): PR push 가 GitHub push protection 에 막혔다. `docs/` 를 git 추적으로 전환하면서 5월 문서 2건의 DockerHub PAT 평문이 커밋에 들어갔다. 두 파일을 추적 제외 + 히스토리에서 제거(`filter-branch`)해 해소. **origin 에는 올라간 적이 없어 이 리포발 외부 유출은 없다.**

### 검증 (증거)

**CI run [33599247862](https://github.com/imjohnkoo/nomacom-frontend/actions/runs/33599247862) — conclusion: success**

| job    | 결과                | 내용                                                              |
| ------ | ------------------- | ----------------------------------------------------------------- |
| `lint` | ✅ success (9/9)    | 전 워크스페이스 eslint 에러 0                                     |
| `gate` | ✅ success (12/12)  | test 157건 → typecheck(baseline 게이트) → 게이트 회귀 → 훅 회귀   |

PR: [#2](https://github.com/imjohnkoo/nomacom-frontend/pull/2)

lint 실체화 결과:

| 워크스페이스               | before                        | after                    |
| -------------------------- | ----------------------------- | ------------------------ |
| `@imjohnkoo/design-mobile` | `echo 'lint placeholder'`     | 실제 eslint — 에러 0     |
| `apps/mobile`              | script 없음                   | 실제 eslint — 에러 0     |
| 전체                       | react-hooks 룰 미정의 4건     | 플러그인 도입 후 0       |

### 남은 것

- **INF-3** Dockerfile 배포 게이트 — 배포 경로에는 여전히 기계 검증이 없다
- **INF-5** (신규) `design-storybook-mobile` 빌드가 clean install 에서 깨짐
- PR #2 머지 — 머지 시 `design-system-publish.yml` 이 트리거되어 DS 0.5.0/0.7.0 이 발행된다
- ⚠️ **DockerHub PAT 회전** — 같은 문서에 「`nomacom-esim-manager-v2` 의 `after_deploy.sh` 에 같은 PAT 평문 커밋」 기록이 있어 그쪽은 실제 노출일 수 있다
