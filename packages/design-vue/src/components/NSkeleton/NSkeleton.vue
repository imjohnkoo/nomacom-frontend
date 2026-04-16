<template>
  <div
    :class="['n-skeleton', { 'n-skeleton--rounded': rounded }]"
    :style="skeletonStyle"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface NSkeletonProps {
  width?: string
  height?: string
  rounded?: boolean
}

const props = withDefaults(defineProps<NSkeletonProps>(), {
  width: '100%',
  height: '1rem',
  rounded: false,
})

const skeletonStyle = computed(() => ({
  width: props.width,
  height: props.height,
}))
</script>

<style scoped>
.n-skeleton {
  background: linear-gradient(
    90deg,
    var(--color-neutral-100, #f5f5f5) 25%,
    var(--color-neutral-200, #e5e5e5) 50%,
    var(--color-neutral-100, #f5f5f5) 75%
  );
  background-size: 200% 100%;
  animation: n-skeleton-pulse 1.5s ease-in-out infinite;
  border-radius: var(--radius-sm, 0.25rem);
}

.n-skeleton--rounded {
  border-radius: var(--radius-full, 9999px);
}

@keyframes n-skeleton-pulse {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
