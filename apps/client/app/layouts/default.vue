<script setup lang="ts">
// 판매 사이트 레이아웃 — 헤더(sticky) + 본문 + 하단 탭(fixed).
// 탭바가 fixed 라 본문 끝에 탭바 높이만큼 자리를 비워 둔다(마지막 줄이 탭바에 가리지 않게).
import ShellHeader from '~/components/shell/ShellHeader.vue'
import BottomTabBar from '~/components/shell/BottomTabBar.vue'
</script>

<template>
  <div class="layout-default">
    <ShellHeader />
    <main class="layout-default__main">
      <slot />
    </main>
    <div class="layout-default__tab-space" aria-hidden="true" />
    <BottomTabBar />
  </div>
</template>

<style scoped>
.layout-default {
  display: flex;
  flex: 1;
  flex-direction: column;
}

.layout-default__main {
  flex: 1;
}

.layout-default__tab-space {
  flex-shrink: 0;
  height: calc(var(--shell-tabbar-height, 56px) + env(safe-area-inset-bottom));
}
</style>
