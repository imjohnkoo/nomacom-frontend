import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5175,
  },
  resolve: {
    alias: {
      '@imjohnkoo/design-vue/style.css': resolve(
        __dirname,
        '../../packages/design-vue/src/styles/base.css',
      ),
      // 차트는 별도 서브엔트리다 (vue-chrts optional peer 라 메인 번들과 분리돼 있다).
      // 더 구체적인 경로라서 아래 '@imjohnkoo/design-vue' 보다 먼저 와야 한다.
      '@imjohnkoo/design-vue/charts': resolve(
        __dirname,
        '../../packages/design-vue/src/charts.ts',
      ),
      '@imjohnkoo/design-vue': resolve(
        __dirname,
        '../../packages/design-vue/src/index.ts',
      ),
    },
  },
})
