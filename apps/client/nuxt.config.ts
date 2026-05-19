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
})
