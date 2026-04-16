<template>
  <div :class="['n-spinner', `n-spinner--${size}`, `n-spinner--${color}`]">
    <svg class="n-spinner__svg" viewBox="0 0 50 50">
      <circle class="n-spinner__track" cx="25" cy="25" r="20" fill="none" stroke-width="4" />
      <circle class="n-spinner__circle" cx="25" cy="25" r="20" fill="none" stroke-width="4" stroke-linecap="round" />
    </svg>
    <span v-if="label" class="n-spinner__label">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
import type { NSize, NColor } from '../../types/common'

export interface NSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: NColor
  label?: string
}

withDefaults(defineProps<NSpinnerProps>(), {
  size: 'md',
  color: 'primary',
  label: undefined,
})
</script>

<style scoped>
.n-spinner {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-2, 0.5rem);
}

.n-spinner__svg {
  animation: n-spinner-rotate 1s linear infinite;
}

.n-spinner--sm .n-spinner__svg { width: 20px; height: 20px; }
.n-spinner--md .n-spinner__svg { width: 32px; height: 32px; }
.n-spinner--lg .n-spinner__svg { width: 48px; height: 48px; }
.n-spinner--xl .n-spinner__svg { width: 64px; height: 64px; }

.n-spinner__track {
  stroke: var(--color-neutral-200, #e5e5e5);
}

.n-spinner__circle {
  stroke-dasharray: 90, 150;
  stroke-dashoffset: 0;
  animation: n-spinner-dash 1.5s ease-in-out infinite;
}

.n-spinner--primary .n-spinner__circle { stroke: var(--color-primary-500, #6239FF); }
.n-spinner--neutral .n-spinner__circle { stroke: var(--color-neutral-500, #737373); }
.n-spinner--success .n-spinner__circle { stroke: var(--color-success-500, #22c55e); }
.n-spinner--warning .n-spinner__circle { stroke: var(--color-warning-500, #f59e0b); }
.n-spinner--error .n-spinner__circle { stroke: var(--color-error-500, #ef4444); }
.n-spinner--info .n-spinner__circle { stroke: var(--color-info-500, #0ea5e9); }

.n-spinner__label {
  font-family: var(--font-fontFamily-sans, sans-serif);
  font-size: var(--font-fontSize-sm, 0.875rem);
  color: var(--color-neutral-500, #737373);
}

@keyframes n-spinner-rotate {
  100% { transform: rotate(360deg); }
}

@keyframes n-spinner-dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}
</style>
