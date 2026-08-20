import { defineNuxtModule, addComponent } from '@nuxt/kit'
import { NUXT_COMPONENTS } from './nuxt-components'

/**
 * Nuxt 모듈 — DS 컴포넌트를 전역 auto-import 로 등록한다.
 *
 * 앱에서 `modules: ['@imjohnkoo/design-vue/nuxt']` 만 넣으면 페이지·컴포넌트에서
 * import 없이 `<NDataTable>` 을 쓸 수 있다. Vue 파일마다 import 줄을 반복하지 않게 하는 것이
 * 목적이지만, 더 중요한 효과는 **채택 장벽 제거**다 — import 를 직접 써야 하면
 * 개발자는 DS 컴포넌트를 찾는 대신 그 자리에서 div 를 손코딩한다.
 *
 * 등록 목록은 `nuxt-components.ts` 가 소유하고,
 * 실제 export 와의 동기화는 `__tests__/nuxt-registration.spec.ts` 가 강제한다.
 */

export default defineNuxtModule({
  meta: {
    name: '@imjohnkoo/design-vue',
    configKey: 'designVue',
  },
  setup() {
    for (const name of NUXT_COMPONENTS) {
      addComponent({
        name,
        export: name,
        filePath: '@imjohnkoo/design-vue',
      })
    }
  },
})
