<script setup lang="ts">
import { Separator as SeparatorRoot } from 'reka-ui'

export interface NSeparatorProps {
  orientation?: 'horizontal' | 'vertical'
  decorative?: boolean
  label?: string
}

withDefaults(defineProps<NSeparatorProps>(), {
  orientation: 'horizontal',
  decorative: true,
  label: undefined,
})
</script>

<template>
  <div
    v-if="label || $slots.default"
    :class="['n-separator-labeled', `n-separator-labeled--${orientation}`]"
  >
    <SeparatorRoot :orientation="orientation" :decorative="decorative" class="n-separator n-separator--horizontal" />
    <span class="n-separator-labeled__text">
      <slot>{{ label }}</slot>
    </span>
    <SeparatorRoot :orientation="orientation" :decorative="decorative" class="n-separator n-separator--horizontal" />
  </div>
  <SeparatorRoot
    v-else
    :orientation="orientation"
    :decorative="decorative"
    :class="[
      'n-separator',
      `n-separator--${orientation}`,
    ]"
  />
</template>

<style scoped>
.n-separator {
  border: none;
  background-color: var(--color-neutral-200);
  flex-shrink: 0;
}

.n-separator--horizontal {
  width: 100%;
  height: var(--borderWidth-1);
}

.n-separator--vertical {
  width: var(--borderWidth-1);
  height: 100%;
  align-self: stretch;
}

.n-separator-labeled {
  display: flex;
  align-items: center;
  gap: var(--spacing-3, 0.75rem);
  width: 100%;
}

.n-separator-labeled__text {
  flex-shrink: 0;
  font-family: var(--font-fontFamily-sans, sans-serif);
  font-size: var(--font-fontSize-sm, 0.875rem);
  font-weight: var(--font-fontWeight-medium, 500);
  color: var(--color-neutral-500, #737373);
  white-space: nowrap;
}
</style>
