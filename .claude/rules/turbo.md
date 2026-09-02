# Turbo 빌드 의존 그래프

`turbo.json`의 `dependsOn: ["^build"]` 설정으로 **upstream-first** 빌드가 자동 보장됩니다:

```
@imjohnkoo/design-tokens  (tsx src/build.ts)
        ↓
@imjohnkoo/design-vue     (vite build library mode)
        ↓
  ┌─────┴─────────────────┐
nomacom-admin    nomacom-client    (nuxt build, 병렬 실행)

@imjohnkoo/design-mobile     (tsc --noEmit, src 직접 export)
        ↓
nomacom-mobile               (Expo / Metro)
```

- Design system 변경 시 → 두 Nuxt 앱 자동 리빌드
- admin만 변경 시 → DS는 캐시 히트, admin만 리빌드

## 루트에서 실행 (Turbo orchestration)

```bash
yarn install                  # 전체 workspace 의존성 설치
yarn turbo run build          # 전체 빌드 (tokens → vue → admin + client 자동 순서)
yarn turbo run dev            # 전체 dev 서버 병렬 실행
yarn turbo run test           # 전체 테스트
yarn turbo run typecheck      # 전체 타입 체크
yarn turbo run clean          # 전체 dist/ 삭제

# 특정 앱만
yarn turbo run build --filter=nomacom-admin
yarn turbo run dev --filter=nomacom-client
yarn turbo run build --filter=@imjohnkoo/design-vue
```

## 개별 workspace에서 직접 실행

```bash
yarn workspace nomacom-admin run dev               # admin Nuxt dev
yarn workspace nomacom-client run build            # client 빌드
yarn workspace @imjohnkoo/design-tokens run build
yarn workspace @imjohnkoo/design-vue run build
yarn workspace nomacom-mobile run dev:web          # Expo web dev
```

각 앱 디렉토리로 이동해서 `yarn nuxt dev` 등 직접 실행도 가능 (Nuxt가 workspace 구조 지원).
