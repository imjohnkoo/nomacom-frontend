import { defineConfig } from 'vitest/config'

// 순수 유닛 테스트만 대상으로 한다.
// .env.local / 로컬 PG / 외부 API 에 의존하는 테스트는 여기 include 에 넣지 말 것 —
// 러너가 환경에 따라 흔들리면 회귀 자산이 아니라 소음이 된다.
// (그런 테스트가 필요하면 별도 config 로 분리하고 plan 에 "로컬 전용" 으로 표기)
export default defineConfig({
  test: {
    environment: 'node',
    include: ['server/**/*.{test,spec}.ts', 'app/**/*.{test,spec}.ts'],
    exclude: ['**/node_modules/**', '**/.nuxt/**', '**/.output/**'],
    // admin 은 아직 server/api/health 뿐이라 테스트가 없다 (2026-09-02 «깡통화» 상태).
    // 실패시키는 대신 통과시키되, 도메인 로직이 들어오는 순간 자동으로 잡히도록 include 는 열어 둔다.
    passWithNoTests: true,
  },
})
