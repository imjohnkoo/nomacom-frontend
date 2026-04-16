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
│   └── app/                     # Expo Router 라우트
│       ├── _layout.tsx          # 루트 레이아웃 (Stack navigator)
│       └── index.tsx            # 홈 스크린 (eSIM 설치 데모)
├── assets/                      # 이미지, 아이콘, 폰트
├── app.json                     # Expo 앱 설정
├── babel.config.js              # babel-preset-expo
├── tsconfig.json                # expo/tsconfig.base 확장
├── expo-env.d.ts                # Expo + Router 타입 참조
└── package.json
```

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

`src/app/index.tsx` 의 `buildAppleUniversalLink(activationCode)` 가 다음 형식의 URL 을 만듭니다:

```
https://esimsetup.apple.com/esim_qrcode_provisioning?carddata=<URL-encoded LPA string>
```

`activationCode` 는 Maya API 가 이미 반환하는 LPA 포맷 문자열 (`LPA:1$smdp.maya.net$<matchingId>`). `Linking.openURL()` 로 열면 iOS 17.4+ 가 이 URL 을 인식해 **네이티브 eSIM 설치 시트**로 직접 점프합니다 (Settings 수동 진입 불필요).

중요:
- **iOS 17.4+ 필수** — 미만 버전에선 링크가 작동 안 함 → fallback 으로 QR 이미지 표시 필요 (향후 작업)
- **WebView 로 열지 말 것** — 반드시 `Linking.openURL` 로 시스템 브라우저/핸들러가 처리해야 eSIM 시트가 뜸
- **CoreTelephony 엔타이틀먼트 불필요** — nomacom 은 MVNO 라 `CTCellularPlanProvisioning` 경로는 닫혀 있음 (Universal Link 가 유일한 경로)

## 현재 상태

**구현 완료:**
- Expo SDK 55 + Expo Router v7 스캐폴딩
- `workspace:*` 로 design-mobile / design-tokens 링크
- 홈 스크린에 eSIM 설치 데모 버튼 (하드코딩된 샘플 LPA)
- 웹 dev 서버 동작 확인

**TODO (후속 작업):**
- `packages/design-mobile` 의 실제 컴포넌트 임포트해서 홈 스크린 리디자인
- nomacom-client 의 4단계 플로우 재구현 (verify → details → select-date → view → install)
- Maya API 호출은 `apps/client/server/api/v1/*` 를 그대로 재사용 (Nitro 엔드포인트 호출)
- Android 는 `EuiccManager` 경로 (native module 필요 — `expo-esim-provisioning` 검토)
- iOS 17.4 미만 QR fallback
- EAS Build 설정 (production 빌드 / TestFlight / Play Console)

## 참고

- [Apple Universal Link for eSIM (iOS 17.4+)](https://esimaccess.com/new-apple-universal-link-for-esim-install/)
- [Expo SDK 55 — Expo Changelog](https://expo.dev/changelog)
- [Expo Router v7 — Expo docs](https://docs.expo.dev/router/introduction/)
- 프로젝트 메모리: `~/.claude/projects/-Users-johnkoo-dev-current-projects-nomacom-frontend/memory/future_mobile_app_esim_install.md`
