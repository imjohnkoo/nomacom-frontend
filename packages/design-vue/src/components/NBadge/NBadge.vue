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
  border-radius: var(--n-radius-full, 9999px);
  font-family: var(--n-font-family-sans, 'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Segoe UI', 'Noto Sans KR', sans-serif);
  font-weight: var(--n-font-weight-medium, 500);
  line-height: var(--n-font-line-height-tight, 1.25);
  white-space: nowrap;
  border: var(--n-border-width-1, 1px) solid transparent;
}

/* --- Sizes --- */
.n-badge--xs {
  padding: 0 var(--n-spacing-1, 0.25rem);
  font-size: var(--n-font-size-xs, 0.75rem);
}

.n-badge--sm {
  padding: var(--n-spacing-0, 0) var(--n-spacing-2, 0.5rem);
  font-size: var(--n-font-size-xs, 0.75rem);
}

.n-badge--md {
  padding: var(--n-spacing-1, 0.25rem) var(--n-spacing-3, 0.75rem);
  font-size: var(--n-font-size-sm, 0.875rem);
}

/* --- Solid variants --- */
.n-badge--primary.n-badge--solid {
  background-color: var(--n-color-primary-600, #5025e8);
  color: var(--n-color-neutral-0, #ffffff);
}

.n-badge--neutral.n-badge--solid {
  background-color: var(--n-color-neutral-600, #525252);
  color: var(--n-color-neutral-0, #ffffff);
}

.n-badge--success.n-badge--solid {
  background-color: var(--n-color-success-500, #22c55e);
  color: var(--n-color-neutral-0, #ffffff);
}

.n-badge--warning.n-badge--solid {
  background-color: var(--n-color-warning-500, #f59e0b);
  color: var(--n-color-neutral-0, #ffffff);
}

.n-badge--error.n-badge--solid {
  background-color: var(--n-color-error-500, #ef4444);
  color: var(--n-color-neutral-0, #ffffff);
}

.n-badge--info.n-badge--solid {
  background-color: var(--n-color-info-500, #0ea5e9);
  color: var(--n-color-neutral-0, #ffffff);
}

/* --- Subtle variants --- */
.n-badge--primary.n-badge--subtle {
  background-color: var(--n-color-primary-50, #f1edff);
  color: var(--n-color-primary-700, #3f1cc0);
}

.n-badge--neutral.n-badge--subtle {
  background-color: var(--n-color-neutral-100, #f5f5f5);
  color: var(--n-color-neutral-700, #404040);
}

.n-badge--success.n-badge--subtle {
  background-color: var(--n-color-success-50, #f0fdf4);
  color: var(--n-color-success-700, #15803d);
}

.n-badge--warning.n-badge--subtle {
  background-color: var(--n-color-warning-50, #fffbeb);
  color: var(--n-color-warning-700, #b45309);
}

.n-badge--error.n-badge--subtle {
  background-color: var(--n-color-error-50, #fef2f2);
  color: var(--n-color-error-700, #b91c1c);
}

.n-badge--info.n-badge--subtle {
  background-color: var(--n-color-info-50, #f0f9ff);
  color: var(--n-color-info-700, #0369a1);
}

/* --- Outline variants --- */
.n-badge--primary.n-badge--outline {
  border-color: var(--n-color-primary-600, #5025e8);
  color: var(--n-color-primary-600, #5025e8);
  background-color: transparent;
}

.n-badge--neutral.n-badge--outline {
  border-color: var(--n-color-neutral-300, #d4d4d4);
  color: var(--n-color-neutral-700, #404040);
  background-color: transparent;
}

.n-badge--success.n-badge--outline {
  border-color: var(--n-color-success-500, #22c55e);
  color: var(--n-color-success-700, #15803d);
  background-color: transparent;
}

.n-badge--warning.n-badge--outline {
  border-color: var(--n-color-warning-500, #f59e0b);
  color: var(--n-color-warning-700, #b45309);
  background-color: transparent;
}

.n-badge--error.n-badge--outline {
  border-color: var(--n-color-error-500, #ef4444);
  color: var(--n-color-error-700, #b91c1c);
  background-color: transparent;
}

.n-badge--info.n-badge--outline {
  border-color: var(--n-color-info-500, #0ea5e9);
  color: var(--n-color-info-700, #0369a1);
  background-color: transparent;
}
</style>
