<script setup lang="ts">
// 오류 화면(catalog spec S-7 · F-13 · D-22) — 404 · 500 을 사이트 틀 안에 한국어로. 상태 코드는 Nuxt 가 그대로 낸다.
// app.vue 대신 그려지므로 프레임(.app-bg · .app-frame — app.vue 의 전역 스타일) · lang · 제목 · noindex 를 여기서 넣는다.
// 이 화면의 링크 · 헤더 · 탭을 누르면 Nuxt 클라이언트 이동이 오류를 지운다.
import type { NuxtError } from '#app'
import type { SearchEntry } from '#shared/catalog/search'
import ErrorPanel from '~/components/shell/ErrorPanel.vue'
import { errorChips, errorHead, errorStatus, errorView, pickChips } from '~/utils/error-view'

const props = defineProps<{ error: NuxtError }>()
// 갈래는 지금 주소로 — useRoute() 는 페이지가 끝까지 그려질 때만 바뀌어서(오류는 페이지가 없다) 앞 화면의 경로가 남는다
const router = useRouter()
const view = computed(() => errorView(errorStatus(props.error), router.currentRoute.value.path))

useHead(() => errorHead(view.value))

// 칩 — 검색 색인에서 필요한 나라만 골라 payload 에 싣는다. 못 읽으면 칩 없이 그린다(오류 화면은 다시 던지지 않는다).
// 칩이 없는 잠시 오류는 부르지 않는다 — 느린 망에서 오류 화면이 이 요청을 기다리지 않게
const { data: chipSets } = await useFetch('/api/catalog/search-index', {
  key: 'error-chips',
  transform: (index: SearchEntry[]) => pickChips(index),
  default: () => pickChips([]),
  immediate: view.value.chips !== null,
})
const chips = computed(() => errorChips(view.value, chipSets.value))

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
