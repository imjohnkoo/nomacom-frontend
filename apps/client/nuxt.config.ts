// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  pages: true,

  components: {
    dirs: [
      {
        path: '~/components',
        pathPrefix: false,
      },
    ],
  },

  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss', '@vueuse/nuxt'],

  css: ['@imjohnkoo/design-vue/style.css', '~/assets/css/animations.css'],

  build: {
    transpile: ['@imjohnkoo/design-vue'],
  },

  runtimeConfig: {
    // Server-only config (not exposed to client)
    databaseUrl: process.env.DATABASE_URL,
    mayaApiEndpoint: process.env.MAYA_API_ENDPOINT,
    mayaApiClientId: process.env.MAYA_API_CLIENT_ID,
    mayaApiClientSecret: process.env.MAYA_API_CLIENT_SECRET,

    // Public config (exposed to client)
    public: {
      apiBase: '/api/v1',
    },
  },

  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    configPath: 'tailwind.config.ts',
  },
});
