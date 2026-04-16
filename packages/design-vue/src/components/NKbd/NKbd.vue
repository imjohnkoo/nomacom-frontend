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
  font-family: var(--font-fontFamily-sans, sans-serif);
  font-weight: var(--font-fontWeight-medium, 500);
  line-height: var(--font-lineHeight-tight, 1.25);
  background-color: var(--color-neutral-100, #f5f5f5);
  color: var(--color-neutral-700, #404040);
  border: var(--borderWidth-1, 1px) solid var(--color-neutral-300, #d4d4d4);
  border-bottom-width: var(--borderWidth-2, 2px);
  border-radius: var(--radius-sm, 0.25rem);
  white-space: nowrap;
}

.n-kbd--xs {
  padding: 0 var(--spacing-1, 0.25rem);
  font-size: var(--font-fontSize-xs, 0.75rem);
  min-width: 1.25rem;
  height: 1.25rem;
}

.n-kbd--sm {
  padding: var(--spacing-0, 0) var(--spacing-1, 0.25rem);
  font-size: var(--font-fontSize-xs, 0.75rem);
  min-width: 1.5rem;
  height: 1.5rem;
}

.n-kbd--md {
  padding: var(--spacing-1, 0.25rem) var(--spacing-2, 0.5rem);
  font-size: var(--font-fontSize-sm, 0.875rem);
  min-width: 1.75rem;
  height: 1.75rem;
}
</style>
