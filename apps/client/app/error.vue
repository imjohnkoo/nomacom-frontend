<script setup lang="ts">
// 오류 화면(catalog spec S-7 · F-13 · D-22) — 404 · 500 을 사이트 틀 안에 한국어로. 상태 코드는 Nuxt 가 그대로 낸다.
// app.vue 대신 그려지므로 프레임(.app-bg · .app-frame — app.vue 의 전역 스타일) · lang · 제목 · noindex 를 여기서 넣는다.
// 이 화면의 링크 · 헤더 · 탭을 누르면 Nuxt 클라이언트 이동이 오류를 지운다.
import type { NuxtError } from '#app'
import type { SearchEntry } from '#shared/catalog/search'
import ErrorPanel from '~/components/shell/ErrorPanel.vue'
import { errorStatus, errorView, pickChips } from '~/utils/error-view'

const props = defineProps<{ error: NuxtError }>()
const route = useRoute()
const view = computed(() => errorView(errorStatus(props.error), route.path))

useHead(() => ({
  htmlAttrs: { lang: 'ko' },
  title: view.value.copy.title,
  titleTemplate: (title?: string) => (title ? `${title} · 이심마니` : '이심마니'),
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
}))

// 칩 — 검색 색인에서 필요한 나라만 골라 payload 에 싣는다. 못 읽으면 칩 없이 그린다(오류 화면은 다시 던지지 않는다)
const { data: chipSets } = await useFetch('/api/catalog/search-index', {
  key: 'error-chips',
  transform: (index: SearchEntry[]) => pickChips(index),
  default: () => pickChips([]),
})
const chips = computed(() => (view.value.chips ? chipSets.value[view.value.chips] : []))

function retry() {
  window.location.reload()
}
</script>

<template>
  <div class="app-bg">
    <div class="app-frame">
      <NuxtLayout name="default">
        <ErrorPanel :view="view" :chips="chips" @retry="retry" />
      </NuxtLayout>
    </div>
  </div>
</template>
