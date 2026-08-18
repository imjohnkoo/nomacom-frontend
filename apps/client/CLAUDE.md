# CLAUDE.md (apps/client)

> ESIMmany (이심마니): eSIM QR code issuance web app for Naver Smart Store customers — **4-step 발급 흐름 완전 복원, prod-ready**

## Current Status (2026-08-18)

깡통 단계 종료. 4-step 유저 흐름 (verify → details → select-date → view) 이 토스풍 디자인으로 복원되어 prod-ready 상태 (`9d04e9d` preview seed 제거 완료). 이전 CLAUDE.md 의 "향후 작업 (깡통 복원 단계)" 5단계는 모두 완료됨:

1. ✅ DB / Drizzle / postgres — `server/db/{schema,index}.ts`
2. ✅ Maya API client — `server/utils/maya-api.ts` (Basic auth)
3. ✅ 4-step pages — `app/pages/{verify,details,select-date,view}/[orderId].vue`
4. ✅ Pinia order store — `app/stores/order.ts` (popup 8종은 legacy 로 미사용 — 아래 참고)
5. ✅ env 키 — `DATABASE_URL`, `MAYA_API_*` (process.env 직접 참조)

이후 hardening (branch `imjohnkoo/client-api-hardening`):

- verify / activate 에 **수신자 대조** (orderId 만으로 타인 PII / activationCode 조회 차단)
- activate **재개 (resume) 로직** — 부분 발급 상태에서 재시도 시 부족분만 이어서 발급, 전량 발급 시 idempotent 성공 응답
- activate **in-flight lock** — 같은 productOrderId 동시 요청 직렬화 (단일 인스턴스 전제)
- vitest 유닛 테스트 도입 (`server/utils/verification.test.ts`)

## Tech Stack

| Layer         | Technology                                          | Notes                                                                |
| ------------- | --------------------------------------------------- | -------------------------------------------------------------------- |
| Framework     | Nuxt 4.4+                                           | SSR + Nitro. Nuxt 3 → 4 마이그레이션됨 (`app/` srcDir)               |
| Styling       | Tailwind 4 (`@tailwindcss/vite`)                    | NanumSquareNeo / Pretendard                                          |
| Design System | `@imjohnkoo/design-vue`, `@imjohnkoo/design-tokens` | workspace deps. 페이지는 DS 컴포넌트 (NButton/NAlertDialog 등) 직접 사용 |
| State         | Pinia (`@pinia/nuxt`)                               | `app/stores/order.ts` — orders / singleOrder                         |
| DB            | PostgreSQL + Drizzle (`postgres` driver)            | **prod DB 스키마를 backend (NestJS TypeORM) 와 공유** — 아래 주의    |
| Maya API      | `server/utils/maya-api.ts`                          | Basic auth, `createEsim` 만 사용                                     |
| Tests         | vitest (server 순수 유틸만)                         | `yarn workspace nomacom-client test`                                 |
| Deployment    | AWS CodeDeploy + SSM + CloudFront                   | `d3un5i1lmp1eem.cloudfront.net`                                      |

## Directory Structure

```
apps/client/
├── app/
│   ├── app.vue                        # 400px 고정 너비 frame
│   ├── assets/css/{main.css, animations.css}
│   ├── components/popup/              # ⚠️ legacy 9종 — 어느 페이지도 import 안 함 (아래 참고)
│   ├── composables/useApi.ts          # verifyOrder / activateOrder ($fetch wrapper)
│   ├── pages/
│   │   ├── index.vue                  # 랜딩
│   │   ├── verify/[orderId].vue       # step 1 — 이름 + 전화번호 입력
│   │   ├── details/[orderId].vue      # step 2 — 주문 (상품) 선택
│   │   ├── select-date/[orderId].vue  # step 3 — 시작 국가 + 날짜 선택 → 발급
│   │   └── view/[orderId].vue         # step 4 — QR 표시 (multi-QR accordion)
│   ├── stores/order.ts                # Pinia
│   ├── types/{api,order}.ts
│   └── utils/{date,formatter}.ts      # formatter: 010-XXXX-XXXX 하이픈 포맷
├── server/
│   ├── api/health.get.ts              # /api/health
│   ├── api/v1/{verify,activate}.post.ts
│   ├── db/{index,schema}.ts           # Drizzle (order/esim/plan/plan-type)
│   ├── middleware/{cors,auth}.ts      # cors: /api/** 화이트리스트, auth: placeholder (토큰 추출만)
│   └── utils/
│       ├── maya-api.ts                # Maya client
│       ├── verification.ts            # 수신자 대조 정규화 (+ .test.ts)
│       ├── string.ts                  # generateEsimTag
│       ├── date.ts                    # createUTCDateTime / createLocalDateTime
│       └── auth.ts, types.ts
├── Dockerfile                         # multi-stage (tokens → vue → client)
├── vitest.config.ts                   # server/**/*.test.ts, node env
└── nuxt.config.ts                     # runtimeConfig.public.apiBase = '/api/v1'
```

## 4-Step 발급 흐름

1. **verify** — 고객이 이름 + 전화번호 입력 → `POST /api/v1/verify`. 서버가 주문 연락처와 **정규화 대조** (전화: 숫자만, 이름: NFC + 공백 제거 + 소문자). 매칭은 **군간 AND + 군내 OR** (john 결정 2026-08-19): 이름은 {구매자명, 수령인명} 중 하나, 전화는 {구매자 전화, 수령인 전화} 중 하나 — 선물 주문 (결제자≠수령인, backend 2026-06 CS 이력) 커버. backend `52dbf65` 는 군간도 OR 로 더 느슨 — client 는 의도적으로 군간 AND. 불일치 시 `verified:false` 만 반환 (취소 여부도 미노출)
2. **details** — orderId 하위 상품주문 목록에서 선택. 선택 시 store 의 수신자 정보로 재검증 호출 (DB 원본값이므로 대조 통과)
3. **select-date** — 시작 국가 + 날짜 선택 → confirm 모달 → `POST /api/v1/activate`. `startTime: -24` 로 전송 → `timeToBeActivatedInUTC` 가 (선택일 −1일) 00:00 현지시각 = eSIM 사전 활성화 버퍼 (`fa27295`)
4. **view** — 발급된 eSIM QR 표시. quantity > 1 이면 accordion 으로 다중 QR

esims 보유 여부에 따라 details ↔ select-date ↔ view 간 리다이렉트 가드 있음.

## API Endpoints

| 경로              | 메서드 | 동작                                                                                                                                                                         |
| ----------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/api/health`     | GET    | `{ status: 'ok', app: 'nomacom-client', commit, timestamp }`                                                                                                                  |
| `/api/v1/verify`  | POST   | 수신자 대조 후 주문 상세 + esims + planType 반환. planTypes 는 `inArray` 일괄 조회 (N+1 없음). `productOrderId` 로 필터 가능                                                  |
| `/api/v1/activate`| POST   | 수신자 대조 (403) → 부족분만 Maya `createEsim` → esim + plan 쌍 트랜잭션 insert. 전량 발급돼 있으면 기존 상태로 idempotent 성공. 같은 주문의 동시 요청은 in-flight lock 직렬화 |

### activate 신뢰성 설계 (변경 시 유지할 불변식)

- **Maya 발급 성공분은 반드시 즉시 DB 기록** — Maya 호출은 외부 side-effect 라 DB 트랜잭션으로 원자성 확보 불가. 트랜잭션은 esim + plan 쌍 원자화에만 사용
- **재시도 = 재개** — 기존 발급 수 `existingCount` 부터 루프 시작 (`generateEsimTag(order, i)` 의 인덱스 연속성 유지). 중간 실패 후 재시도해도 초과 발급 없음
- **in-flight lock 은 단일 Nitro 인스턴스 전제** — 다중 인스턴스 확장 시 DB advisory lock 등으로 교체 필요. prod DB 스키마가 backend 공유라 unique 제약 추가는 신중히

## DB 주의사항

`server/db/schema.ts` 는 **prod DB (TypeORM camelCase) 에 맞춘 Drizzle 선언** (`350713b`):

- 테이블명: `order`, `esim`, `plan`, `plan-type` (hyphen)
- FK 컬럼: TypeORM 기본 naming — `orderProductOrderId`, `esimEsimId`, `planTypePlanTypeId`
- backend (NestJS) 가 같은 DB 를 사용하므로 **스키마 변경 (drizzle-kit push 등) 금지** — 스키마 변경은 backend 와 합의 후

## 환경 변수

| 키                                                              | 용도                                        |
| --------------------------------------------------------------- | ------------------------------------------- |
| `DATABASE_URL`                                                  | postgres 연결. prod 는 SSL require          |
| `MAYA_API_ENDPOINT` / `MAYA_API_CLIENT_ID` / `MAYA_API_CLIENT_SECRET` | Maya B2B API (Basic auth)             |

`process.env` 직접 참조 (runtimeConfig 아님). prod 는 `/nomacom/shared/maya/*`, `/nomacom/shared/db/*`, `/nomacom/client/*` SSM 경로에서 `after_deploy.sh` 가 주입. 상세는 `.claude/rules/ssm-paths.md`.

## Key Commands

```bash
yarn workspace nomacom-client dev          # dev server (--dotenv .env.local)
yarn workspace nomacom-client test         # vitest (server utils 유닛)
yarn turbo run build --filter=nomacom-client

# Docker
docker build -f apps/client/Dockerfile -t nomacom-client:test .
```

## Legacy: `app/components/popup/` (9종, 미사용)

`AlertModal, BaseModal, CancelledOrderAlertModal, ConfirmOrderModal, IssueQrCodesModal, LoadingModal, NoOrderAlertModal, PullingOrdersModal, ServerErrorModal` — grep 확인 결과 (2026-08-18) 어느 페이지/컴포넌트도 import 하지 않음. 페이지들이 DS 의 `NAlertDialog` / `NLoaderDialog` / `NBottomSheet` 를 직접 사용하면서 대체됨. **삭제 여부는 별도 판단 필요** (Nuxt auto-import 미사용 확인됨 — 참조 0).

## Maya B2B 정책 (카피/로직 작성 시 준수)

ESIMmany 는 Maya B2B 리셀러로 **자체 정책 통제** — Maya B2C 공식 문서를 fallback 진실로 간주 금지 (메모리 `maya_b2b_policy_control`):

- 사용일수는 자정이 아닌 **첫 연결 시점부터 24h rolling** 차감 — UI 카피 위배 금지
- 다국가 플랜은 개통 후 **자동 로밍** — 국가 간 이동 시 추가 설치/설정 없음
- 소진 후 속도 선택 (128/500/1000 kbps) 등 자체 설정

## 관련 문서

- 루트 `CLAUDE.md` — monorepo 구성, Turbo, Nuxt 4 마이그 노트
- `.claude/rules/deployment.md` — CodeDeploy + GHA + CloudFront 흐름
- `.claude/rules/ssm-paths.md` — SSM 경로 (확정)
- `apps/admin/CLAUDE.md` — admin (dual DB: admin DB / eSIM 메인 DB)
- memory: `maya_b2b_policy_control`, `esim_usage_policy_copy` — 정책 진실 기준
- memory: `future_mobile_app_esim_install` — mobile 앱 Universal Link 흐름
