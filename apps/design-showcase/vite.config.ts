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
      '@imjohnkoo/design-vue': resolve(
        __dirname,
        '../../packages/design-vue/src/index.ts',
      ),
    },
  },
})
