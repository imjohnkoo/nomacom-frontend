<template>
  <span :class="['n-chip', `n-chip--${color}`]">
    <span class="n-chip__label">
      <slot>{{ label }}</slot>
    </span>
    <button
      v-if="closable"
      class="n-chip__close"
      type="button"
      aria-label="Remove"
      @click.stop="emit('close')"
    >
      &times;
    </button>
  </span>
</template>

<script setup lang="ts">
import type { NColor } from '../../types/common'

export interface NChipProps {
  label?: string
  color?: NColor
  closable?: boolean
}

withDefaults(defineProps<NChipProps>(), {
  label: undefined,
  color: 'neutral',
  closable: false,
})

const emit = defineEmits<{
  close: []
}>()
</script>

<style scoped>
.n-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1, 0.25rem);
  border-radius: var(--radius-full, 9999px);
  padding: var(--spacing-1, 0.25rem) var(--spacing-3, 0.75rem);
  font-family: var(--font-fontFamily-sans, sans-serif);
  font-size: var(--font-fontSize-sm, 0.875rem);
  font-weight: var(--font-fontWeight-medium, 500);
  line-height: var(--font-lineHeight-tight, 1.25);
}

.n-chip__label {
  white-space: nowrap;
}

.n-chip__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
  margin-left: var(--spacing-1, 0.25rem);
  font-size: 1rem;
  line-height: 1;
  color: inherit;
  opacity: 0.7;
  border-radius: var(--radius-full, 9999px);
  width: 1rem;
  height: 1rem;
  transition: opacity var(--transition-fast, 150ms ease);
}

.n-chip__close:hover {
  opacity: 1;
}

/* --- Color variants --- */
.n-chip--primary {
  background-color: var(--color-primary-50, #eff6ff);
  color: var(--color-primary-700, #1d4ed8);
}

.n-chip--neutral {
  background-color: var(--color-neutral-100, #f5f5f5);
  color: var(--color-neutral-700, #404040);
}

.n-chip--success {
  background-color: var(--color-success-50, #f0fdf4);
  color: var(--color-success-700, #15803d);
}

.n-chip--warning {
  background-color: var(--color-warning-50, #fffbeb);
  color: var(--color-warning-700, #b45309);
}

.n-chip--error {
  background-color: var(--color-error-50, #fef2f2);
  color: var(--color-error-700, #b91c1c);
}

.n-chip--info {
  background-color: var(--color-info-50, #eff6ff);
  color: var(--color-info-700, #1d4ed8);
}
</style>
