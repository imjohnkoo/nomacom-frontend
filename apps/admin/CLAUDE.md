# CLAUDE.md (apps/admin)

## Project Overview

**nomacom-admin** — ESIMmany (이심마니) 사업 운영자용 어드민 대시보드. Nuxt 4 기반.

**Current status (2026-05-19)**: **배포 파이프라인 검증용 깡통 빌드** 상태. 모든 도메인 로직 (운영자/주문/플랜/eSIM/네이버 OAuth) 및 DB 의존성이 제거됨. 남은 것:

- `app/pages/index.vue` — "staging" 안내 카드 (placeholder)
- `app/layouts/default.vue` — `<slot />` 만
- `server/api/health.get.ts` — `/api/health` (`{status, app, commit, timestamp}`)
- Dockerfile + design-tokens/design-vue workspace 빌드 체인

이전 작업 (users CRUD, eSIM read-only API, dual DB connection, Drizzle schema) 은 git history (commit `2202458` 기준) 에 보존. 깡통 + AWS CodeDeploy 1회 성공 후 단계적으로 재도입.

## Tech Stack

- **Framework**: Nuxt 4 (Vue 3, Nitro server)
- **Language**: TypeScript (루트 `tsconfig.base.json` extends)
- **Design System**: `@imjohnkoo/design-tokens`, `@imjohnkoo/design-vue` (workspace deps — 코드에선 아직 미사용)
- **DB**: 현재 미연결. 운영자 인증 부활 시 PostgreSQL + Drizzle 재도입 예정.
- **Auth / Validation / Testing**: 미도입
- **Package Manager**: Yarn 4 (Berry)
- **Deployment**: AWS CodeDeploy + SSM (`.claude/rules/deployment.md` / `ssm-paths.md` 참조)

## Directory Structure

```
apps/admin/
├── app/
│   ├── app.vue
│   ├── assets/
│   ├── components/             # (현재 빈 디렉토리)
│   ├── layouts/default.vue     # <slot /> 만
│   └── pages/index.vue         # staging 카드
├── server/
│   └── api/health.get.ts       # /api/health
├── Dockerfile                  # multi-stage (tokens → vue → admin)
├── nuxt.config.ts
├── package.json                # name: nomacom-admin
└── tsconfig.json
```

## API Endpoints

| 경로          | 메서드 | 동작                                                        |
| ------------- | ------ | ----------------------------------------------------------- |
| `/api/health` | GET    | `{ status: 'ok', app: 'nomacom-admin', commit, timestamp }` |

## Key Commands

```bash
yarn workspace nomacom-admin dev          # dev server (localhost:3000)
yarn workspace nomacom-admin build        # production build → .output/

# Or via turbo (design-tokens + design-vue 의존 자동 처리)
yarn turbo run dev --filter=nomacom-admin
yarn turbo run build --filter=nomacom-admin

# Docker
docker build -f apps/admin/Dockerfile -t nomacom-admin:test .
docker run -p 3000:3000 nomacom-admin:test
```

## 환경 변수

깡통 단계에서는 필수 env 없음. 컨테이너 부팅에 DB / 외부 secret 필요 없음.

`/api/health` 가 `process.env.GIT_COMMIT` 을 읽지만 미지정 시 `"unknown"` 으로 fallback.

운영 기능 재도입 시 `/nomacom/admin/*` + `/nomacom/shared/*` SSM 경로 사용 (after_deploy.sh 가 주입). 상세 키 매핑은 `.claude/rules/ssm-paths.md`.

## 향후 작업 (memo)

깡통 → 운영 admin 으로 복원할 때 단계별로 부활:

1. 운영자 인증 (cookie session + argon2) + `users` 테이블 + admin DB 연결 재도입
2. 디자인 시스템 `nuxt.config.ts` 에 import (`css`, `vite.optimizeDeps` 등)
3. eSIM 메인 DB read-only 조회 (orders / esims / plans / plan-types / naver-oauth)
4. Naver OAuth 토큰 갱신 흐름
5. Zod 입력 검증 + 페이지네이션 + 필터

각 단계는 별 PR 로 분리. 깡통 빌드는 그 사이 시점에도 prod 배포 가능 상태 유지.

## 관련 문서

- 루트 `CLAUDE.md`
- `.claude/rules/turbo.md` — 빌드 의존 그래프
- `.claude/rules/deployment.md` — CodeDeploy + GitHub Actions 흐름
- `.claude/rules/ssm-paths.md` — SSM 경로 (확정)
