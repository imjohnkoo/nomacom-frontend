# nomacom-mobile

Expo SDK 55 기반 iOS/Android 앱. `packages/design-mobile`, `packages/design-tokens` 를 `workspace:*` 로 직접 참조합니다.

## 기술 스택

- **Expo SDK 55** (React Native 0.83, React 19.2)
- **Expo Router v7** (파일 기반 라우팅, `src/app/` 디렉토리)
- **New Architecture 활성화** (`newArchEnabled: true`)
- **Metro monorepo 자동 설정** (SDK 52+ 부터 지원, `metro.config.js` 불필요)

## 디렉토리 구조

```
apps/mobile/
├── src/
│   ├── app/                     # Expo Router 라우트
│   │   ├── _layout.tsx          # OrderProvider + Stack
│   │   ├── index.tsx            # 홈 — 주문번호 입력
│   │   ├── verify/[orderId].tsx      # step 1 — 본인 확인
│   │   ├── details/[orderId].tsx     # step 2 — 상품주문 선택
│   │   ├── select-date/[orderId].tsx # step 3 — 국가/날짜 → 발급
│   │   └── view/[orderId].tsx        # step 4 — 설치 (UL/수동 코드)
│   ├── components/              # flow-screen 등 앱 로컬 컴포넌트
│   └── lib/                     # api / types(re-export) / store / 유틸
├── app.json                     # Expo 앱 설정
├── eas.json                     # EAS 빌드 프로필 (실행은 승인 대기)
├── babel.config.js              # babel-preset-expo
├── tsconfig.json                # expo/tsconfig.base 확장
└── package.json
```

상세 컨텍스트는 `apps/mobile/CLAUDE.md` 참조.

## 실행

### 전제 조건

- Node.js 22+
- Corepack 으로 활성화된 Yarn 4.5.3 (루트에서 `corepack enable && corepack prepare yarn@4.5.3 --activate`)
- 루트에서 `yarn install` 을 한 번 이상 실행한 상태

### Dev server

```bash
# 1. 브라우저 프리뷰 (가장 빠름 — 시뮬레이터 불필요)
yarn workspace nomacom-mobile dev:web
# → http://localhost:8081

# 2. iOS Simulator (Xcode 설치 필요)
yarn workspace nomacom-mobile dev:ios

# 3. Android Emulator (Android Studio 필요)
yarn workspace nomacom-mobile dev:android

# 4. 대화형 (Expo Go 앱으로 QR 스캔)
yarn workspace nomacom-mobile dev
```

가장 간단한 테스트 경로는 **`dev:web`** 입니다 — Metro 가 react-native-web 으로 번들링해 브라우저에서 바로 확인 가능합니다. 실제 eSIM 설치 버튼(Apple Universal Link)은 iOS 17.4+ 기기에서만 실제로 eSIM 설치 시트를 띄우고, 웹/Android 에서는 링크 이동만 발생합니다.

## eSIM 설치 동작 원리

`src/lib/esim.ts` 의 `buildAppleUniversalLink(activationCode)` 가 다음 형식의 URL 을 만듭니다:

```
https://esimsetup.apple.com/esim_qrcode_provisioning?carddata=<URL-encoded LPA string>
```

`activationCode` 는 Maya API 가 이미 반환하는 LPA 포맷 문자열 (`LPA:1$smdp.maya.net$<matchingId>`). `Linking.openURL()` 로 열면 iOS 17.4+ 가 이 URL 을 인식해 **네이티브 eSIM 설치 시트**로 직접 점프합니다 (Settings 수동 진입 불필요).

중요:
- **iOS 17.4+ 필수** — 미만 버전에선 링크가 작동 안 함 → fallback 으로 QR 이미지 표시 필요 (향후 작업)
- **WebView 로 열지 말 것** — 반드시 `Linking.openURL` 로 시스템 브라우저/핸들러가 처리해야 eSIM 시트가 뜸
- **CoreTelephony 엔타이틀먼트 불필요** — nomacom 은 MVNO 라 `CTCellularPlanProvisioning` 경로는 닫혀 있음 (Universal Link 가 유일한 경로)

## 현재 상태 (2026-08-19)

**구현 완료:**
- Expo SDK 55 + Expo Router v7 스캐폴딩, `workspace:*` 로 design-mobile / design-tokens 링크
- 4-step 게스트 발급 흐름 (verify → details → select-date → view) — `apps/client/server/api/v1/*` Nitro 를 그대로 호출
- iOS 17.4+ Universal Link 설치 CTA + 수동 코드 fallback / Android 수동 코드 안내 (`expo-clipboard` 복사)
- `@imjohnkoo/design-mobile` 0.3.1 컴포넌트 (4-step 세트) 도입
- eas.json (development / preview / production 채널)

**TODO (후속 작업):**
- EAS 실행 (`eas init` / 첫 빌드) — john 승인·개입 대기
- QR 이미지 렌더 (타 기기 설치 케이스 — `react-native-qrcode-svg` 의존 필요)
- Android `EuiccManager` 자동 설치 경로 (native module 필요 — 제조사 파편화로 보류)
- iOS 17.4 미만 fallback 고도화
- https Universal Links 딥링크 (AASA — app.esimmany.com 전환 후)

## 참고

- [Apple Universal Link for eSIM (iOS 17.4+)](https://esimaccess.com/new-apple-universal-link-for-esim-install/)
- [Expo SDK 55 — Expo Changelog](https://expo.dev/changelog)
- [Expo Router v7 — Expo docs](https://docs.expo.dev/router/introduction/)
- 프로젝트 메모리: `~/.claude/projects/-Users-johnkoo-dev-current-projects-nomacom-frontend/memory/future_mobile_app_esim_install.md`
