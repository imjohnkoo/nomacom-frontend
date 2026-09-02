# PR1 — client+mobile 뼈대 (A 안, Nitro 단일 backend)

> 상위 plan: `docs/plans/2026-05-20-client-mobile-feature-plan-draft.html`
> 결정 (2026-05-21): **A 안 (Nitro 단일 backend) + workspace 직접 의존 (apps/mobile → apps/client server route 타입 import)**

## 1. 목표

운영 가능한 minimal end-to-end shell. 다음을 동시에 만족하는 상태로 prod 배포 가능:

1. **운영 게스트 흐름 100% 복원** — `nomacom-client-nuxt3` (Nuxt 3) 의 4-step 흐름 (verify → details → select-date → view) 을 `apps/client` (Nuxt 4) 에서 그대로 동작
2. **모바일이 같은 Nitro 를 호출** — `apps/mobile` 의 1개 데모 화면이 `/api/v1/verify` 를 fetch + Bearer 헤더 컨벤션 검증
3. **백엔드 컨벤션 셋업** — 인증 미들웨어(cookie/Bearer 듀얼) placeholder, CORS routeRules, `X-Client-Platform` 헤더 컨벤션
4. **타입 공유** — `apps/mobile` 의 `package.json` 에 `"nomacom-client": "workspace:*"` 추가, mobile 측이 client 의 server route 타입을 직접 import

## 2. 비목표 (다음 phase)

- 신규 회원가입 / 로그인 / OAuth — placeholder middleware 만, 실 인증 로직 없음
- 자체 이심 발급 / 결제 / 카탈로그 / plan-type 가격 컬럼
- 보유 이심 관리 / 잔여 데이터 조회 / 토픽업
- design-vue 신규 컴포넌트로 popup 8종 점진 교체 — 본 PR 은 nuxt3 의 8 popup 그대로 가져옴. 교체는 별 PR
- mobile 의 design-mobile 토큰 동기 — 본 PR 은 inline style 그대로 둠
- 다국어 / 다크모드

## 3. 작업 그래프 (의존 순서)

```
[3.1] DB 스키마 + Drizzle 셋업           ◀── nuxt3 그대로 복사
        ↓
[3.2] server/utils (maya-api, auth, string, date)
        ↓
[3.3] server/api/v1/{verify,activate}.post.ts
        ↓
[3.4] 백엔드 컨벤션 미들웨어 + nitro routeRules (CORS, auth placeholder)
        ↓
[3.5] Pinia store + composables/useApi
        ↓
[3.6] 4-step pages 복원 (Nuxt 4 app/ 디렉토리 구조로)
        ↓
[3.7] popup 8종 + animations.css
        ↓
[3.8] runtimeConfig + nuxt.config.ts 환경변수 확장
        ↓
[3.9] apps/mobile workspace dep + verify demo 화면
        ↓
[3.10] turbo build + dev 동작 확인
```

## 4. 파일별 변경 사항

### 4.1 신규 의존성 (`apps/client/package.json`)

```jsonc
{
  "dependencies": {
    // 기존 유지
    "drizzle-orm": "^0.45.1",        // 신규 — DB 접근
    "postgres": "^3.4.8",             // 신규 — postgres-js driver
    "date-fns": "^4.1.0",             // 신규
    "date-fns-tz": "^3.2.0",          // 신규
    "@headlessui/vue": "^1.7.23",     // 신규 — popup/listbox (점진 교체 대상)
    "@heroicons/vue": "^2.2.0",       // 신규
    "vue-tailwind-datepicker": "^1.7.4",  // 신규 — select-date 페이지
    "qrcode-vue3": "^1.7.1"           // 신규 — view 페이지
  },
  "devDependencies": {
    "drizzle-kit": "^0.31.8"          // 신규 — migration
  }
}
```

### 4.2 server/ 계층 — nuxt3 에서 그대로 포팅

| 파일 | 출처 | 변경 |
|---|---|---|
| `apps/client/server/db/schema.ts` | nuxt3 `server/db/schema.ts` | 그대로. 4 테이블 (order/esim/plan/plan-type) |
| `apps/client/server/db/index.ts` | nuxt3 `server/db/index.ts` | 그대로. `useDB()` |
| `apps/client/server/utils/maya-api.ts` | nuxt3 | 그대로. `useMayaApi()` (Basic auth, createEsim, getEsimDetails) |
| `apps/client/server/utils/auth.ts` | nuxt3 | 그대로. `getBasicAuthHeader()` — Maya 용 |
| `apps/client/server/utils/string.ts` | nuxt3 | 그대로. `generateEsimTag()`, `extractHyphenFromPhoneNumber()` |
| `apps/client/server/utils/date.ts` | nuxt3 | 그대로. `createUTCDateTime()`, `createLocalDateTime()` |
| `apps/client/server/api/v1/verify.post.ts` | nuxt3 | 그대로. `~/server/db` import path 검증 (Nuxt 4 srcDir 영향) |
| `apps/client/server/api/v1/activate.post.ts` | nuxt3 | 그대로. 같은 import path 검증 |
| `apps/client/drizzle.config.ts` | nuxt3 | 루트가 아닌 `apps/client/drizzle.config.ts` 위치, schema path 동일 |

### 4.3 백엔드 컨벤션 — 신규

| 파일 | 역할 |
|---|---|
| `apps/client/server/middleware/cors.ts` | 모바일/Expo dev/prod origin 허용. `X-Client-Platform` 헤더 expose. |
| `apps/client/server/middleware/auth.ts` | placeholder. `Authorization: Bearer ...` 또는 cookie `nomacom_session` 둘 다 받아서 `event.context.user` 에 채우거나 null. 본 PR 은 토큰 검증 실 로직 없이 형태만. |
| `apps/client/server/utils/types.ts` | 공용 응답 타입 (`ApiResponse<T>`, `ApiErrorResponse`) 정의. mobile 도 동일 import. |
| `apps/client/nuxt.config.ts` | `nitro.routeRules` 에 `/api/**` CORS 추가. `runtimeConfig` 확장 (databaseUrl, mayaApi*) |

### 4.4 app/ 계층 — Nuxt 4 srcDir = `app/`

nuxt3 코드는 srcDir 가 루트였으므로 `pages/`, `stores/`, `composables/`, `components/`, `types/`, `utils/` 가 루트에 있었음. Nuxt 4 는 `app/` 하위로 이동.

| Nuxt 4 위치 | 출처 |
|---|---|
| `apps/client/app/pages/index.vue` | nuxt3 `pages/index.vue` (주문번호 입력 랜딩) — 현 깡통 페이지 대체 |
| `apps/client/app/pages/verify/[orderId].vue` | nuxt3 그대로 |
| `apps/client/app/pages/details/[orderId].vue` | nuxt3 그대로 |
| `apps/client/app/pages/select-date/[orderId].vue` | nuxt3 그대로 |
| `apps/client/app/pages/view/[orderId].vue` | nuxt3 그대로 |
| `apps/client/app/stores/order.ts` | nuxt3 그대로 |
| `apps/client/app/composables/useApi.ts` | nuxt3 그대로 |
| `apps/client/app/types/order.ts` | nuxt3 그대로 |
| `apps/client/app/types/api.ts` | nuxt3 그대로 |
| `apps/client/app/utils/date.ts` | nuxt3 그대로 |
| `apps/client/app/utils/formatter.ts` | nuxt3 그대로 |
| `apps/client/app/components/popup/{8개}` | nuxt3 그대로 |
| `apps/client/app/assets/css/animations.css` | 이미 존재 (깡통에 남아있음) |

`app.vue` 는 현 400px 프레임 유지. `app/pages/index.vue` 만 nuxt3 랜딩으로 교체.

### 4.5 mobile (apps/mobile)

| 파일 | 변경 |
|---|---|
| `apps/mobile/package.json` | `"nomacom-client": "workspace:*"` 추가 (타입 공유용). 외에 `expo-secure-store` (다음 phase 인증 토큰 저장 대비, 본 PR 에선 사용 X — 선택사항) |
| `apps/mobile/src/lib/api.ts` | 신규. `fetch` wrapper. base URL = `process.env.EXPO_PUBLIC_API_BASE_URL` (dev: `http://localhost:3000`). `X-Client-Platform: mobile` 헤더 + 미래의 Bearer 토큰 자리 |
| `apps/mobile/src/lib/types.ts` | 신규. `import type { VerifyOrderRequest, VerifyOrderResponse } from 'nomacom-client/app/types/api'` — workspace 직접 의존 검증 포인트 |
| `apps/mobile/src/app/index.tsx` | 현재 Universal Link 데모 카드 아래에 "Test /api/v1/verify" 섹션 추가. 더미 orderId/fullName/phone 으로 호출 → 응답 표시. iOS Simulator 에선 `http://localhost:3000` 직접 호출 가능. |
| `apps/mobile/app.json` | `extra.apiBaseUrl` 또는 env 키 추가 (EAS prod 빌드 대비) |

## 5. import path 주의사항 (Nuxt 4 마이그)

루트 CLAUDE.md 의 Nuxt 4 마이그 노트:
- nuxt3 의 `~/server/*` import 는 Nuxt 4 에서 `app/server/*` 로 잘못 해석됨
- → `server/api/v1/verify.post.ts` 내부의 `import { useDB, schema } from '~/server/db'` 를 **상대 경로 (`../../db`)** 로 변경 필요
- `server/utils/maya-api.ts` 도 같은 패턴 (현재는 utils → ../db 등 상대경로라 OK 추정, 코드 보고 확정)

app/ 측의 `~/types/order` 등은 srcDir=`app/` 이라 자동으로 올바른 경로 해석 (변경 불필요).

## 6. 환경변수 / SSM

이미 확정된 SSM 키 (변경 없음):
- `/nomacom/shared/maya/MAYA_API_ENDPOINT`
- `/nomacom/shared/maya/MAYA_API_CLIENT_ID`
- `/nomacom/shared/maya/MAYA_API_CLIENT_SECRET`
- `/nomacom/client/DATABASE_URL`

local 개발: `apps/client/.env.local` 신설 (gitignore). 템플릿:
```
DATABASE_URL=postgres://...
MAYA_API_ENDPOINT=https://api.maya.net/connectivity/v1
MAYA_API_CLIENT_ID=...
MAYA_API_CLIENT_SECRET=...
```

mobile dev: `apps/mobile/.env.local`
```
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
```

## 7. 검증 / 테스트 단계

1. `yarn install` — workspace 의존성 해석 확인
2. `yarn turbo run build --filter=nomacom-client` — Nuxt 4 빌드 성공
3. `yarn workspace nomacom-client dev` 후
   - `curl http://localhost:3000/api/health` → ok
   - `curl http://localhost:3000/api/v1/verify -X POST -d '{"orderId":1,"fullName":"테스트","phoneNumber":"010-0000-0000"}'` → DB 조회 동작 확인 (verified:false 면 OK, throw 면 import path 점검)
   - 브라우저 `/` → 주문번호 입력 → /verify → /details → /select-date → /view 4-step 동작 (실 운영 DB 또는 staging DB 필요)
4. `yarn workspace nomacom-mobile dev:web` 또는 `dev:ios`
   - 데모 화면에서 verify 호출 → 응답 JSON 표시
   - 네트워크 탭에서 `X-Client-Platform: mobile` 헤더 확인
   - CORS preflight (OPTIONS) 200 확인
5. `yarn workspace nomacom-mobile typecheck` — workspace 직접 의존 타입 import 동작 확인

## 8. 리스크

| 항목 | 대응 |
|---|---|
| Nuxt 4 srcDir 차이로 `~/server` import 깨짐 | 5절. 상대경로로 변경, build 시점에 잡힘 |
| Drizzle migration 이력 없음 (nuxt3 도 migration 폴더 미포함) | DB schema 는 운영 DB 가 이미 정의되어 있다는 전제. drizzle migration 신규 생성은 다음 phase (회원 테이블 추가 시) |
| Maya API 키 staging vs prod 분리 | 본 PR 은 운영 키만. staging Maya 가 없으면 dev 환경에서 activate.post.ts 호출 시 실 Maya 차감 — verify 까지만 dev 에서 검증 |
| `app/` 디렉토리 안에 `server/` 두면 안 됨 | server/ 는 루트(apps/client/server/) 에 유지. Nuxt 4 의 Nitro 가 자동 인식 |
| workspace 직접 의존 → mobile 빌드 시 client 의 모든 dep 도 deps tree 로 끌려옴 | 타입만 import 라 tree-shaking 안전. EAS 빌드 시 시간 약간 증가는 감수 |
| mobile 의 fetch 가 dev 에서 localhost:3000 인식 못함 (iOS Simulator) | Simulator 는 localhost 직접 OK. 실 디바이스는 같은 LAN IP 사용 필요. 본 PR 은 Simulator 검증만 |
| 인증 미들웨어 placeholder 가 실 인증 우회로 보일 위험 | placeholder 는 `event.context.user = null` 로만 채움. 실제 권한 체크는 다음 phase 에서 endpoint 별 명시적 가드 |

## 9. PR 분할 검토

본 PR 의 범위가 큰 편이라 **2개로 쪼개는 안** 도 가능:

- **PR1a**: server/ 계층 (4.2 + 4.3) + verify 한 페이지만 + api/health 외 endpoint 동작 확인. mobile 미포함.
- **PR1b**: 나머지 3 페이지 + popup 8종 + mobile verify demo.

장점: 리뷰 단위 작음, PR1a 가 prod 배포 가능. 단점: 게스트 흐름이 PR1b 까지 미완.

> 본 plan 은 단일 PR 가정으로 작성. PR1a/1b 분할 원하면 §3 그래프의 (3.6) 직전을 절단선으로.

## 10. 작업 후 다음 단계 (PR2 candidates)

1. **인증 실 구현** — 휴대폰 OTP (SOLAPI) + Kakao 로그인. `users` + `user_oauth` Drizzle migration. orders.user_id FK
2. **design-vue popup 교체** — NAlertDialog / NLoaderDialog 로 8 popup 점진 대체
3. **mobile verify 데모 → 실 4-step 미러** — Expo Router 로 같은 4-step 흐름
4. **plan-type 가격 컬럼 + 카탈로그 endpoint** — 자체 발급 phase 준비

---

## 부록 A. 변경 파일 체크리스트

### 신규 파일 (apps/client)
- [ ] `server/db/schema.ts`
- [ ] `server/db/index.ts`
- [ ] `server/utils/maya-api.ts`
- [ ] `server/utils/auth.ts`
- [ ] `server/utils/string.ts`
- [ ] `server/utils/date.ts`
- [ ] `server/utils/types.ts` (신규 컨벤션)
- [ ] `server/api/v1/verify.post.ts`
- [ ] `server/api/v1/activate.post.ts`
- [ ] `server/middleware/cors.ts`
- [ ] `server/middleware/auth.ts`
- [ ] `app/composables/useApi.ts`
- [ ] `app/stores/order.ts`
- [ ] `app/types/order.ts`
- [ ] `app/types/api.ts`
- [ ] `app/utils/date.ts`
- [ ] `app/utils/formatter.ts`
- [ ] `app/components/popup/{8개}`
- [ ] `app/pages/verify/[orderId].vue`
- [ ] `app/pages/details/[orderId].vue`
- [ ] `app/pages/select-date/[orderId].vue`
- [ ] `app/pages/view/[orderId].vue`
- [ ] `drizzle.config.ts`
- [ ] `.env.local.example` (선택)

### 수정 (apps/client)
- [ ] `app/pages/index.vue` — 깡통 카드 → 주문번호 입력 랜딩
- [ ] `nuxt.config.ts` — runtimeConfig, nitro.routeRules
- [ ] `package.json` — drizzle-orm 등 7개 의존성 추가

### 신규 / 수정 (apps/mobile)
- [ ] `package.json` — `nomacom-client: workspace:*` 추가
- [ ] `src/lib/api.ts`
- [ ] `src/lib/types.ts`
- [ ] `src/app/index.tsx` — verify demo 섹션 추가
- [ ] `.env.local.example`
