# CLAUDE.md — nomacom-frontend

## 개요

Nomacom 프론트엔드 프로젝트들을 통합한 Yarn 4 + Turborepo monorepo. 참조 템플릿은 `m8-frontend` 였다.

## 구성 원칙

- **패키지 매니저**: Yarn 4.5.3 (Berry, `nodeLinker: node-modules`). Corepack 로 버전 고정
- **오케스트레이션**: Turborepo 2.3. `^build` 토폴로지컬 의존성으로 `design-tokens → design-vue → apps` 순서 자동화
- **내부 의존성**: `workspace:*` 프로토콜. npm 레지스트리가 아닌 로컬 workspace 해석
- **TypeScript**: 루트 `tsconfig.base.json` 을 각 패키지가 `extends`
- **Lint/Format**: 루트 `eslint.config.js` (flat config) + `.prettierrc` 공유

## Workspaces

### Packages (`packages/*`)

| 이름 | 역할 |
|---|---|
| `@imjohnkoo/design-tokens` | 토큰 JSON → CSS 변수 + JS 상수 빌드 (tsx 스크립트) |
| `@imjohnkoo/design-vue` | Vue 3 컴포넌트 라이브러리. Vite lib build + `vite-plugin-dts` |
| `@imjohnkoo/design-mobile` | React Native 컴포넌트. `tsc --noEmit` 타입 체크만 수행, src 직접 export |

### Apps (`apps/*`)

| 이름 | 프레임워크 | 참고 |
|---|---|---|
| `nomacom-admin` | Nuxt 4 | `app/` 디렉토리 구조, `server/` 에 Nitro API + Drizzle schema |
| `nomacom-client` | Nuxt 4 | Nuxt 3 → 4 마이그레이션됨. `app/` 로 이동, server 코드는 상대 경로 import |
| `nomacom-mobile` | Expo SDK 55 (RN 0.83, React 19.2) | Expo Router v7, `src/app/` 루트. Metro 는 SDK 52+ 부터 monorepo 자동 설정 (config 없음). iOS eSIM 설치는 Apple Universal Link 사용 — MVNO 라 CoreTelephony entitled API 경로는 불가. |
| `design-showcase` | Vite + Vue | 디자인 시스템 개발용. vite.config 에서 source alias 사용 |
| `design-demo`, `design-demo-webapp` | Vite + Vue | 디자인 시스템 데모 |
| `design-storybook-mobile` | Storybook | React Native Web 기반 |

## Turbo 파이프라인

`turbo.json`:

- `build`: `dependsOn: ["^build"]`, outputs `dist/**`, `.output/**`, `.nuxt/**`
- `dev`: `cache: false`, `persistent: true` — 병렬 dev 서버
- `lint`, `typecheck`: `dependsOn: ["^build"]`
- `test`: `dependsOn: ["build"]`
- `clean`: `cache: false`

## 모바일 앱 노트 (apps/mobile)

- **Expo managed workflow** 만 사용. bare workflow 로 가지 말 것 — iOS 17.4+ Universal Link 방식이라 native 모듈이 거의 불필요하고, Expo managed 를 유지하면 `yarn install` 외 추가 native 빌드 툴체인이 필요 없음
- **Metro 설정은 건드리지 말 것** — Expo SDK 52+ 부터 monorepo 가 자동 지원됨. `metro.config.js` 를 만들면 오히려 `watchFolders`, `nodeModulesPaths` 등이 중복되어 문제가 발생함
- **루트 디렉토리는 `src/app/`** — SDK 55 의 새 기본값. 이전 `app/` 루트 대신 `src/app/` 을 사용하므로 루트의 `app/` 폴더를 만들면 충돌
- **tsconfig 는 `expo/tsconfig.base` 확장** — 루트 `tsconfig.base.json` 이 아님. Nuxt/Vue 용 설정과 RN 용 module resolution 이 다르기 때문
- **peer dep 경고 중 `@expo/log-box` 누락** — expo-router 가 요구하지만 런타임 문제 없음, 필요시 `yarn workspace nomacom-mobile add @expo/log-box`
- **`simctl` 에러는 무시** — `dev:web` 만 쓸 때는 iOS Simulator 가 없어서 뜨는 경고. dev server 동작에는 무관
- **Maya API 연동은 `apps/client/server/api/v1/*` 의 Nitro 엔드포인트를 그대로 호출** — 모바일용 별도 백엔드 필요 없음

## Nuxt 4 마이그레이션 노트 (apps/client)

Nuxt 3 → 4 변환 시 적용한 변경:

1. **디렉토리 구조**: `app.vue`, `assets/`, `components/`, `composables/`, `pages/`, `plugins/`, `stores/`, `utils/`, `types/` 를 `app/` 하위로 이동
2. **Server 코드 import**: 기존 `~/server/*` 는 Nuxt 4 에서 `app/server/*` 로 잘못 해석되므로, `server/api/v1/*.ts` 내 imports 를 상대 경로 (`../../db` 등) 로 변경
3. **Tailwind content paths**: `tailwind.config.ts` 의 content glob 을 `./app/components/**` 등으로 수정
4. **App 레이어 `~/` imports**: Nuxt 4 에서 `~/` 가 srcDir (`app/`) 를 가리키므로 `~/types/order` 등은 자동으로 올바른 경로로 해석됨 (변경 불필요)

## 빌드/실행

```bash
corepack enable && corepack prepare yarn@4.5.3 --activate
yarn install
yarn turbo run build

# 개발
yarn workspace nomacom-admin dev
yarn workspace nomacom-client dev
yarn workspace design-showcase dev
yarn workspace @imjohnkoo/design-vue dev   # watch 빌드
```

## Peer Dependency 경고 (알려진 사항)

현재 `yarn install` 시 경고가 몇 개 발생하지만 빌드에는 영향 없음:

- `@imjohnkoo/design-vue` 가 `typescript` peer 요구 (vite-plugin-dts) — 루트 devDep 에 있음
- `design-storybook-mobile` 가 `react-native` peer 요구 — Web 빌드에서만 사용하므로 무해
- `nomacom-client` 가 `tailwindcss` peer 요구 (vue-tailwind-datepicker) — `@nuxtjs/tailwindcss` 가 전이적으로 제공

엄격히 하려면 각 앱에 해당 peer 의존성을 명시적으로 추가 가능.

## 비포함 범위 (후속 작업)

- GitHub Actions 워크플로우 (`admin-production.yml`, `client-production.yml` 등)
- Dockerfile, AWS CodeDeploy `appspec.yml`, `deploy/scripts/`
- AWS SSM Parameter Store 연동
- 원본 디렉토리 (`nomacom-admin`, `nomacom-client-nuxt3`, `nomacom-design-system`) 아카이브 혹은 삭제
- `@imjohnkoo/design-*` npm 배포 파이프라인 유지 여부 결정
