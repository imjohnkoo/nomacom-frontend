// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  pages: true,

  modules: ['@pinia/nuxt', '@vueuse/nuxt'],

  css: ['~/assets/css/main.css', '@imjohnkoo/design-vue/style.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  build: {
    transpile: ['@imjohnkoo/design-vue'],
  },

  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL,
    mayaApiEndpoint: process.env.MAYA_API_ENDPOINT,
    mayaApiClientId: process.env.MAYA_API_CLIENT_ID,
    mayaApiClientSecret: process.env.MAYA_API_CLIENT_SECRET,
    // CORS 화이트리스트 — 정적 origins 외 추가 (콤마 separated env)
    corsExtraOrigins: (process.env.CORS_EXTRA_ORIGINS ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    public: {
      apiBase: '/api/v1',
    },
  },
})
