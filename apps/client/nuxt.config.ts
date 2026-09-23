// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'
import { buildRobotsRouteRules } from './shared/utils/robots'

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

  // noindex · 캐시 금지 헤더 — 목록은 shared/utils/robots.ts 하나 (meta · robots.txt 와 같은 출처)
  routeRules: buildRobotsRouteRules(),

  nitro: {
    // 카탈로그(K1) — server/data/catalog.json(W1-1 export) 또는 표본 픽스처. server/utils/catalog.ts 가 읽는다
    serverAssets: [{ baseName: 'catalog', dir: 'data' }],
  },

  runtimeConfig: {
    public: {
      apiBase: '/api/v1',
      // 게스트 발급 호스트(K3) — 판매 사이트의 주문번호 조회가 이 호스트의 /verify/{주문번호} 로 보낸다.
      // 로컬은 NUXT_PUBLIC_GUEST_APP_ORIGIN=http://localhost:3000 으로 덮는다.
      guestAppOrigin: 'https://app.esimmany.com',
      // PortOne V2 공개값 — /checkout-preview 전용. 값은 리포에 두지 않는다(런타임 env 로만).
      // SSM /nomacom/client/NUXT_PUBLIC_PORTONE_STORE_ID · NUXT_PUBLIC_PORTONE_TEST_CHANNEL_KEY
      // → after_deploy.sh 가 키 이름 끝 토막을 env 이름으로 쓰므로 NUXT_PUBLIC_ 접두가 그대로 런타임 덮어쓰기가 된다.
      // ⚠️ testChannelKey 에는 테스트 채널키만 — 실채널키는 다른 이름으로(Phase 2).
      portone: {
        storeId: '',
        testChannelKey: '',
      },
    },
  },
})
