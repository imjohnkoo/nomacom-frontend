<template>
  <div
    :class="[
      'n-field-group',
      `n-field-group--${orientation}`,
      `n-field-group--gap-${gap}`,
    ]"
    role="group"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import type { NOrientation } from '../../types/common'

export interface NFieldGroupProps {
  orientation?: 'horizontal' | 'vertical'
  gap?: 'sm' | 'md' | 'lg'
}

withDefaults(defineProps<NFieldGroupProps>(), {
  orientation: 'vertical',
  gap: 'md',
})
</script>

<style scoped>
.n-field-group {
  display: flex;
  width: 100%;
}

/* --- Orientation --- */
.n-field-group--vertical {
  flex-direction: column;
}

.n-field-group--horizontal {
  flex-direction: row;
  align-items: flex-start;
}

/* --- Gap --- */
.n-field-group--gap-sm {
  gap: var(--spacing-2, 0.5rem);
}

.n-field-group--gap-md {
  gap: var(--spacing-4, 1rem);
}

.n-field-group--gap-lg {
  gap: var(--spacing-6, 1.5rem);
}

/* Allow children to grow equally in horizontal layout */
.n-field-group--horizontal > :deep(*) {
  flex: 1;
  min-width: 0;
}
</style>
