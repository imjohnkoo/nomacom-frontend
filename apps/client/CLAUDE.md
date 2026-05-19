# CLAUDE.md (apps/client)

> ESIMmany (이심마니): eSIM QR code issuance web app for Naver Smart Store customers — **현재는 깡통 빌드 (배포 파이프라인 검증용)**

## Current Status (2026-05-19)

**배포 파이프라인 검증용 깡통 빌드** 상태. 4-step 유저 흐름 (verify → details → select-date → view), Maya API 연동, DB 접근, Pinia stores, 모든 도메인 컴포넌트가 제거됨.

남은 것:

- `app/pages/index.vue` — staging 카드 (DS `NLogo` 사용)
- `app/app.vue` — 400px 고정 너비 레이아웃 골격
- `app/assets/css/main.css` — Tailwind 4 + 폰트 (NanumSquareNeo / Pretendard) 유지
- `server/api/health.get.ts` — `/api/health`
- DS / Tailwind / Pinia / VueUse 통합 유지 (재도입 마찰 최소화)

이전 코드 (verify/activate API, Maya client, Drizzle schema, 4-step pages, 8 popups) 는 git history (commit `2202458` 시점) 에 보존. CodeDeploy 1회 성공 후 단계적 복원.

## Tech Stack (현재 유효)

| Layer         | Technology                                          | Notes                                                   |
| ------------- | --------------------------------------------------- | ------------------------------------------------------- |
| Framework     | Nuxt 4.4+                                           | SSR + Nitro                                             |
| Styling       | Tailwind 4 (`@tailwindcss/vite`)                    | NanumSquareNeo / Pretendard                             |
| Design System | `@imjohnkoo/design-vue`, `@imjohnkoo/design-tokens` | workspace deps + `style.css` import + `build.transpile` |
| State         | Pinia (`@pinia/nuxt`)                               | (현재 store 없음, 미래용으로 모듈만 유지)               |
| Composables   | `@vueuse/nuxt`                                      | (auto import)                                           |
| DB            | (제거)                                              | 부활 시 PostgreSQL + Drizzle 재도입 예정                |
| Maya API      | (제거)                                              | 부활 시 server/utils/maya-api 재도입                    |
| Tests         | 미도입                                              |                                                         |
| Deployment    | AWS CodeDeploy + SSM + CloudFront                   | 깡통 검증 완료 (`d3un5i1lmp1eem.cloudfront.net` 예정)   |

## Directory Structure (현재)

```
apps/client/
├── app/
│   ├── app.vue                       # 400px 고정 너비 frame
│   ├── assets/
│   │   ├── css/{main.css, animations.css}
│   │   ├── fonts/                    # NanumSquareNeo, Pretendard
│   │   ├── icons/                    # (도메인 자산 — 부활 시 사용)
│   │   └── images/
│   └── pages/index.vue               # staging 카드
├── server/
│   └── api/health.get.ts             # /api/health
├── public/                           # favicon, fonts, icons (assets/ 와 중복 — 기술 부채)
├── Dockerfile                        # multi-stage (tokens → vue → client)
├── nuxt.config.ts                    # DS + Tailwind 4 + Pinia + VueUse
├── package.json                      # name: nomacom-client
└── tsconfig.json
```

## API Endpoints

| 경로          | 메서드 | 동작                                                         |
| ------------- | ------ | ------------------------------------------------------------ |
| `/api/health` | GET    | `{ status: 'ok', app: 'nomacom-client', commit, timestamp }` |

## 환경 변수

깡통 단계에서는 필수 env 없음. 컨테이너 부팅에 DB / Maya API 키 필요 없음.

운영 기능 재도입 시 `/nomacom/shared/maya/*`, `/nomacom/shared/db/*`, `/nomacom/client/*` SSM 경로 사용 (`after_deploy.sh` 가 주입). 상세는 `.claude/rules/ssm-paths.md`.

## Key Commands

```bash
yarn workspace nomacom-client dev          # dev server
yarn workspace nomacom-client build        # production build

# Turbo (design-tokens + design-vue 의존 자동 처리)
yarn turbo run dev --filter=nomacom-client
yarn turbo run build --filter=nomacom-client

# Docker
docker build -f apps/client/Dockerfile -t nomacom-client:test .
docker run -p 3000:3000 nomacom-client:test
```

## 향후 작업 (memo — 깡통 복원 단계)

1. DB / Drizzle / postgres 재도입 + `server/db/schema.ts` (eSIM 메인 DB)
2. Maya API client + `server/utils/maya-api.ts` + Basic auth
3. 4-step pages 복원 (verify / details / select-date / view)
4. 8 popup 컴포넌트 + Pinia order store
5. `runtimeConfig` 에 DATABASE*URL / MAYA_API*\* 키 복원 + `after_deploy.sh` 의 NUXT*PUBLIC* alias 매핑

각 단계는 별 PR. 사이 시점에도 prod 배포 가능 상태 유지.

## Maya B2B 정책 (도메인 부활 시 주의)

ESIMmany 는 Maya B2B 리셀러로 **자체 정책 통제 가능**. Maya B2C 공식 문서를 fallback 진실로 간주 금지. 메모리 `maya_b2b_policy_control` 참조 — 회선 ON 시점 활성화, 24h 갱신, 소진 후 속도 선택 (128/500/1000 kbps) 등 자체 설정.

## 관련 문서

- 루트 `CLAUDE.md` — monorepo 구성, Turbo, Nuxt 4 마이그 노트
- `.claude/rules/deployment.md` — CodeDeploy + GHA + CloudFront 흐름
- `.claude/rules/ssm-paths.md` — SSM 경로 (확정)
- `apps/admin/CLAUDE.md` — 동일 패턴의 admin 깡통 빌드
- memory: `maya_b2b_policy_control` — 도메인 복원 시 진실 기준
- memory: `future_mobile_app_esim_install` — mobile 앱 Universal Link 흐름
