<template>
  <main class="n-main">
    <slot />
  </main>
</template>

<script setup lang="ts">
// props 없음 — 레이아웃 슬롯 컨테이너. 빈 interface 는 any 를 허용하므로 선언하지 않는다.
export type NMainProps = Record<string, never>
</script>

<style scoped>
.n-main {
  flex: 1;
  overflow-y: auto;
}
</style>
