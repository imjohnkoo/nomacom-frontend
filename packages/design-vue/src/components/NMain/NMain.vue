<template>
  <main class="n-main">
    <slot />
  </main>
</template>

<script setup lang="ts">
export interface NMainProps {}
</script>

<style scoped>
.n-main {
  flex: 1;
  overflow-y: auto;
}
</style>
