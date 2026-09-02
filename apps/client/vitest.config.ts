import { defineConfig } from 'vitest/config';

// server/ 순수 유틸 유닛 테스트 전용 — Nuxt 런타임/DB 불필요
export default defineConfig({
  test: {
    include: ['server/**/*.test.ts'],
    environment: 'node',
  },
});
