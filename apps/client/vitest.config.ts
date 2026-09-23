import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

// 순수 유닛 테스트 + Nuxt 에 기대지 않는 작은 컴포넌트 테스트(happy-dom — 파일 머리
// `// @vitest-environment happy-dom` · 대상 컴포넌트는 vue 에서 명시 import)만 대상으로 한다.
// .env.local / 로컬 PG / 외부 API 에 의존하는 테스트는 여기 include 에 넣지 말 것 —
// 러너가 환경에 따라 흔들리면 회귀 자산이 아니라 소음이 된다.
// (그런 테스트가 필요하면 별도 config 로 분리하고 plan 에 "로컬 전용" 으로 표기)
export default defineConfig({
  plugins: [vue()],
  // app/ 코드의 `~/…` import (Nuxt srcDir alias) — 미들웨어 테스트가 쓴다
  // `#shared/…` — Nuxt 4 의 shared/ 별칭(app 코드 · 콘텐츠 테스트가 쓴다)
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./app', import.meta.url)),
      '#shared': fileURLToPath(new URL('./shared', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: [
      'server/**/*.{test,spec}.ts',
      'app/**/*.{test,spec}.ts',
      'shared/**/*.{test,spec}.ts',
    ],
    exclude: ['**/node_modules/**', '**/.nuxt/**', '**/.output/**'],
    // client 는 server · app · shared 순수 로직 테스트가 있다(2026-09-23 W1-3 647건 — 컴포넌트 6종 포함).
    // 0건이 되면 «테스트가 사라진 것» 이므로 실패시킨다.
    passWithNoTests: false,
  },
})
