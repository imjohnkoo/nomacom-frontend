<template>
  <span
    :class="[
      'n-badge',
      `n-badge--${color}`,
      `n-badge--${variant}`,
      `n-badge--${size}`,
    ]"
  >
    <slot>{{ label }}</slot>
  </span>
</template>

<script setup lang="ts">
import type { NColor } from '../../types/common'

export interface NBadgeProps {
  label?: string
  color?: NColor
  variant?: 'solid' | 'subtle' | 'outline'
  size?: 'xs' | 'sm' | 'md'
}

withDefaults(defineProps<NBadgeProps>(), {
  label: undefined,
  color: 'primary',
  variant: 'solid',
  size: 'sm',
})
</script>

<style scoped>
.n-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full, 9999px);
  font-family: var(--font-fontFamily-sans, sans-serif);
  font-weight: var(--font-fontWeight-medium, 500);
  line-height: var(--font-lineHeight-tight, 1.25);
  white-space: nowrap;
  border: var(--borderWidth-1, 1px) solid transparent;
}

/* --- Sizes --- */
.n-badge--xs {
  padding: 0 var(--spacing-1, 0.25rem);
  font-size: var(--font-fontSize-xs, 0.75rem);
}

.n-badge--sm {
  padding: var(--spacing-0, 0) var(--spacing-2, 0.5rem);
  font-size: var(--font-fontSize-xs, 0.75rem);
}

.n-badge--md {
  padding: var(--spacing-1, 0.25rem) var(--spacing-3, 0.75rem);
  font-size: var(--font-fontSize-sm, 0.875rem);
}

/* --- Solid variants --- */
.n-badge--primary.n-badge--solid {
  background-color: var(--color-primary-600, #2563eb);
  color: var(--color-neutral-0, #ffffff);
}

.n-badge--neutral.n-badge--solid {
  background-color: var(--color-neutral-600, #525252);
  color: var(--color-neutral-0, #ffffff);
}

.n-badge--success.n-badge--solid {
  background-color: var(--color-success-500, #22c55e);
  color: var(--color-neutral-0, #ffffff);
}

.n-badge--warning.n-badge--solid {
  background-color: var(--color-warning-500, #f59e0b);
  color: var(--color-neutral-0, #ffffff);
}

.n-badge--error.n-badge--solid {
  background-color: var(--color-error-500, #ef4444);
  color: var(--color-neutral-0, #ffffff);
}

.n-badge--info.n-badge--solid {
  background-color: var(--color-info-500, #3b82f6);
  color: var(--color-neutral-0, #ffffff);
}

/* --- Subtle variants --- */
.n-badge--primary.n-badge--subtle {
  background-color: var(--color-primary-50, #eff6ff);
  color: var(--color-primary-700, #1d4ed8);
}

.n-badge--neutral.n-badge--subtle {
  background-color: var(--color-neutral-100, #f5f5f5);
  color: var(--color-neutral-700, #404040);
}

.n-badge--success.n-badge--subtle {
  background-color: var(--color-success-50, #f0fdf4);
  color: var(--color-success-700, #15803d);
}

.n-badge--warning.n-badge--subtle {
  background-color: var(--color-warning-50, #fffbeb);
  color: var(--color-warning-700, #b45309);
}

.n-badge--error.n-badge--subtle {
  background-color: var(--color-error-50, #fef2f2);
  color: var(--color-error-700, #b91c1c);
}

.n-badge--info.n-badge--subtle {
  background-color: var(--color-info-50, #eff6ff);
  color: var(--color-info-700, #1d4ed8);
}

/* --- Outline variants --- */
.n-badge--primary.n-badge--outline {
  border-color: var(--color-primary-600, #2563eb);
  color: var(--color-primary-600, #2563eb);
  background-color: transparent;
}

.n-badge--neutral.n-badge--outline {
  border-color: var(--color-neutral-300, #d4d4d4);
  color: var(--color-neutral-700, #404040);
  background-color: transparent;
}

.n-badge--success.n-badge--outline {
  border-color: var(--color-success-500, #22c55e);
  color: var(--color-success-700, #15803d);
  background-color: transparent;
}

.n-badge--warning.n-badge--outline {
  border-color: var(--color-warning-500, #f59e0b);
  color: var(--color-warning-700, #b45309);
  background-color: transparent;
}

.n-badge--error.n-badge--outline {
  border-color: var(--color-error-500, #ef4444);
  color: var(--color-error-700, #b91c1c);
  background-color: transparent;
}

.n-badge--info.n-badge--outline {
  border-color: var(--color-info-500, #3b82f6);
  color: var(--color-info-700, #1d4ed8);
  background-color: transparent;
}
</style>
