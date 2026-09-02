# CLAUDE.md (apps/mobile)

> nomacom-mobile: eSIMmany 의 iOS/Android 앱 — **4-step 발급 흐름 + iOS Universal Link 설치 구현됨 (weekly B 트랙, 2026-08-19)**

## Current Status (2026-08-19)

PR1 뼈대 (`76936d8`) 위에 mobile MVP 구현 완료:

1. ✅ 4-step 게스트 흐름 — `/verify → /details → /select-date → /view` (client 웹과 동일 정책·카피)
2. ✅ 홈 화면 — 주문번호 입력 진입 (게스트, 로그인 없음)
3. ✅ iOS 17.4+ Universal Link 설치 CTA + 수동 코드 fallback / Android 수동 코드 안내 (`expo-clipboard` 복사)
4. ✅ `@imjohnkoo/design-mobile` 0.3.1 도입 — 4-step 용 신규 12종 컴포넌트 사용
5. ✅ eas.json (dev/preview/prod 채널) — **실행은 john 승인 대기** (`eas init` 미실행, projectId 없음)

스펙 정본: `docs/proposals/mobile/2026-08-19-mobile-mvp-proposal.md` (gitignore — 메인 체크아웃 docs/ 에 사본).

## 제약 (루트 CLAUDE.md "모바일 앱 노트" 와 정합 — 위배 금지)

- **Expo managed workflow 만** — bare 로 가지 말 것. Universal Link 방식이라 native 모듈 불필요
- **`metro.config.js` 만들지 말 것** — SDK 52+ monorepo 자동 지원. 만들면 watchFolders 중복으로 깨짐
- **라우트 루트는 `src/app/`** — 루트 `app/` 폴더 생성 금지 (충돌)
- **tsconfig 는 `expo/tsconfig.base` 확장** — 루트 `tsconfig.base.json` 아님
- **iOS eSIM 설치는 Apple Universal Link** (`esimsetup.apple.com/esim_qrcode_provisioning?carddata=<LPA>`) — MVNO 라 CoreTelephony entitled API (`CTCellularPlanProvisioning`) 불가. 반드시 `Linking.openURL` (WebView 금지)
- **백엔드는 `apps/client/server/api/v1/*` Nitro 그대로 호출** — 모바일용 별도 백엔드 금지
- **wire 타입은 `nomacom-client` re-export** (`src/lib/types.ts`) — 자체 타입 정의 금지. client 타입 변경 시 이 앱 typecheck 가 깨지며 감지 (의도된 동작)
- **배포는 EAS** — CodeDeploy 경로 아님

## Tech Stack

| Layer      | Technology                                  | Notes                                                 |
| ---------- | ------------------------------------------- | ----------------------------------------------------- |
| Runtime    | Expo SDK 55 (RN 0.83, React 19.2)           | managed, `newArchEnabled: true`                       |
| Routing    | Expo Router v7                              | `src/app/` 파일 라우팅, typed routes experiment on    |
| DS         | `@imjohnkoo/design-mobile` (workspace)      | 0.3.1 — 4-step 세트 포함. theme = design-tokens 기반  |
| State      | React Context (`src/lib/order-store.tsx`)   | client Pinia `order` store 의 최소 대응물             |
| API        | `src/lib/api.ts` fetch wrapper              | `EXPO_PUBLIC_API_BASE_URL` + `X-Client-Platform: mobile` + Bearer 자리 |
| Clipboard  | `expo-clipboard`                            | managed 호환, config plugin 불필요                    |
| Identity   | `com.nomacom.mobile` / scheme `nomacommobile` | 딥링크: `nomacommobile://verify/<orderId>`          |

## Directory Structure

```
apps/mobile/
├── src/
│   ├── app/                        # Expo Router 라우트
│   │   ├── _layout.tsx             # OrderProvider + Stack (headerShown: false)
│   │   ├── index.tsx               # 홈 — 주문번호 입력
│   │   ├── verify/[orderId].tsx    # step 1 — 이름 + 전화번호 본인 확인
│   │   ├── details/[orderId].tsx   # step 2 — 상품주문 선택 (재검증 후 분기)
│   │   ├── select-date/[orderId].tsx # step 3 — 국가/날짜 선택 → activate
│   │   └── view/[orderId].tsx      # step 4 — 설치 (UL 버튼 / 수동 코드)
│   ├── components/flow-screen.tsx  # SafeArea + 키보드 회피 + flexGrow 래퍼
│   └── lib/
│       ├── api.ts                  # verify / activate / health
│       ├── types.ts                # nomacom-client wire 타입 re-export (단일 소스)
│       ├── order-store.tsx         # orders / singleOrder Context
│       ├── format.ts               # 전화번호 하이픈/검증 (client 포팅)
│       ├── date.ts                 # CalDate/날짜 유틸 (date-fns 미도입 — handroll)
│       └── esim.ts                 # buildAppleUniversalLink
├── eas.json                        # dev/preview/prod 프로필 (실행 승인 대기)
├── app.json                        # scheme, bundle id — eas init 후 extra.eas.projectId 추가됨
└── .env.local.example              # EXPO_PUBLIC_API_BASE_URL
```

## 4-Step 흐름 노트 (client 와의 차이)

- 흐름·분기·다이얼로그·카피는 client (`apps/client/app/pages/*`) 와 동일. **차이는 view (step 4) 만**:
  - client = QR 이미지 중심 (다른 기기로 스캔) / mobile = **설치할 기기에서 보고 있다** 가 기본 → iOS 는 Universal Link CTA, Android 는 수동 코드
  - QR 이미지 렌더는 MVP 제외 (svg 의존) — 타 기기 설치는 코드/링크 복사로 대체
- details 선택 시 store 의 수신자 정보로 **재검증** 호출 — verify 의 수신자 대조 (군간 AND + 군내 OR) 를 DB 원본값으로 통과
- `startTime: -24` 불변 유지 — activate 가 (선택일 −1일) 00:00 현지시각을 `timeToBeActivatedInUTC` 로 저장 (사전 활성화 버퍼, client `fa27295`)
- 각 화면은 store 가 비면 `/verify/[orderId]` 로 가드 (세션 없음)

## 카피 정책 (위배 금지 — memory `esim_usage_policy_copy`)

- 사용일수는 자정이 아닌 **첫 연결 시점부터 24h rolling** 차감
- 다국가는 개통 후 **자동 로밍** — 국가 간 이동 시 추가 설치/설정 없음

## EAS (B-2 — 설정만 완료, 실행 승인 대기)

| 프로필 | 채널 | 배포 | API base |
| --- | --- | --- | --- |
| development | development | internal (iOS simulator 허용, dev client) | localhost:3000 |
| preview | preview | internal | CloudFront (`d3un5i1lmp1eem.cloudfront.net`) |
| production | production | store, autoIncrement | `app.esimmany.com` — **첫 prod 빌드 전 도메인 활성 여부 john 확인** |

- **john 개입 필요 (미실행)**: `eas login` → `eas init` (projectId 발급, app.json 에 자동 기록) → `yarn workspace nomacom-mobile eas:build:dev` 등. Apple Developer Program + `com.nomacom.mobile` 번들 등록도 선행 필요
- `EXPO_PUBLIC_*` 는 빌드 타임 인라인 — 채널별 env 는 eas.json 에서 관리 (secret 아님. 진짜 secret 은 `eas secret`)

## Key Commands

```bash
yarn workspace nomacom-mobile typecheck     # tsc --noEmit (wire 타입 파리티 게이트)
yarn workspace nomacom-mobile dev:web       # 브라우저 프리뷰 (simctl 에러는 무해)
yarn workspace nomacom-mobile dev           # Expo Go QR
# 실기기 LAN 테스트: .env.local 의 EXPO_PUBLIC_API_BASE_URL 을 LAN IP 로
```

## 알려진 사항

- `dev:web` 실행 시 simctl 에러 로그 — iOS Simulator 부재 경고일 뿐, dev 서버 동작 무관
- peer dep 경고 중 `@expo/log-box` 누락 — 런타임 문제 없음 (루트 CLAUDE.md 참조)
- verify 를 가짜 값으로 호출하면 `verified:false` — client-api-hardening 의 수신자 실 대조 도입 이후 실제 주문 데이터 필요
- Android 자동 설치 (LPA intent / `EuiccManager`) 는 native module + 제조사 파편화로 보류 — 수동 코드 안내가 MVP 경로

## 관련 문서

- 루트 `CLAUDE.md` — "모바일 앱 노트" (이 문서와 정합 유지 의무)
- `apps/client/CLAUDE.md` — 4-step 서버 정책 (verify 대조, activate 재개/락)
- `packages/design-mobile/CHANGELOG.md` — 0.3.1 컴포넌트 세트
- `docs/proposals/mobile/2026-08-19-mobile-mvp-proposal.md` — MVP 스펙 정본 (+ .html)
- memory: `future_mobile_app_esim_install`, `esim_usage_policy_copy`
