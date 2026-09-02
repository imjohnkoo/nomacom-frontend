<template>
  <kbd :class="['n-kbd', `n-kbd--${size}`]">
    <slot>{{ value }}</slot>
  </kbd>
</template>

<script setup lang="ts">
export interface NKbdProps {
  value?: string
  size?: 'xs' | 'sm' | 'md'
}

withDefaults(defineProps<NKbdProps>(), {
  value: undefined,
  size: 'sm',
})
</script>

<style scoped>
.n-kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--n-font-family-sans, 'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Segoe UI', 'Noto Sans KR', sans-serif);
  font-weight: var(--n-font-weight-medium, 500);
  line-height: var(--n-font-line-height-tight, 1.25);
  background-color: var(--n-color-neutral-100, #f5f5f5);
  color: var(--n-color-neutral-700, #404040);
  border: var(--n-border-width-1, 1px) solid var(--n-color-neutral-300, #d4d4d4);
  border-bottom-width: var(--n-border-width-2, 2px);
  border-radius: var(--n-radius-sm, 0.25rem);
  white-space: nowrap;
}

.n-kbd--xs {
  padding: 0 var(--n-spacing-1, 0.25rem);
  font-size: var(--n-font-size-xs, 0.75rem);
  min-width: 1.25rem;
  height: 1.25rem;
}

.n-kbd--sm {
  padding: var(--n-spacing-0, 0) var(--n-spacing-1, 0.25rem);
  font-size: var(--n-font-size-xs, 0.75rem);
  min-width: 1.5rem;
  height: 1.5rem;
}

.n-kbd--md {
  padding: var(--n-spacing-1, 0.25rem) var(--n-spacing-2, 0.5rem);
  font-size: var(--n-font-size-sm, 0.875rem);
  min-width: 1.75rem;
  height: 1.75rem;
}
</style>
