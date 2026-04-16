<template>
  <ToastRoot
    :duration="duration"
    :class="['n-toast', `n-toast--${color}`]"
    @update:open="(val: boolean) => { if (!val) $emit('close') }"
  >
    <div class="n-toast__content">
      <ToastTitle v-if="title" class="n-toast__title">
        {{ title }}
      </ToastTitle>
      <ToastDescription v-if="description" class="n-toast__description">
        {{ description }}
      </ToastDescription>
    </div>
    <ToastClose class="n-toast__close" aria-label="Dismiss">
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <line x1="4" y1="4" x2="12" y2="12" />
        <line x1="12" y1="4" x2="4" y2="12" />
      </svg>
    </ToastClose>
  </ToastRoot>
</template>

<script setup lang="ts">
import {
  ToastRoot,
  ToastTitle,
  ToastDescription,
  ToastClose,
} from 'reka-ui'

import type { NColor } from '../../types/common'

export interface NToastProps {
  /** Toast title */
  title?: string
  /** Toast description */
  description?: string
  /** Semantic color */
  color?: NColor
  /** Auto-dismiss duration in ms */
  duration?: number
}

withDefaults(defineProps<NToastProps>(), {
  title: undefined,
  description: undefined,
  color: 'neutral',
  duration: 5000,
})

defineEmits<{
  close: []
}>()
</script>

<style>
.n-toast {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-3, 0.75rem);
  width: 360px;
  max-width: 100vw;
  padding: var(--spacing-4, 1rem);
  border-radius: var(--radius-lg, 0.5rem);
  border: var(--borderWidth-1, 1px) solid var(--color-neutral-200, #e5e7eb);
  background-color: var(--color-neutral-0, #ffffff);
  box-shadow: var(--shadow-lg, 0 10px 15px -3px rgb(0 0 0 / 0.1));
  font-family: var(--font-fontFamily-sans, sans-serif);
  animation: n-toast-slide-in var(--transition-normal, 200ms) ease;
}

.n-toast[data-swipe='move'] {
  transform: translateX(var(--reka-toast-swipe-move-x));
}

.n-toast[data-swipe='cancel'] {
  transform: translateX(0);
  transition: transform var(--transition-fast, 150ms) ease;
}

.n-toast[data-swipe='end'] {
  animation: n-toast-swipe-out var(--transition-fast, 150ms) ease forwards;
}

.n-toast[data-state='closed'] {
  animation: n-toast-fade-out var(--transition-fast, 150ms) ease forwards;
}

/* --- Color variants --- */
.n-toast--neutral {
  border-left: 3px solid var(--color-neutral-400, #9ca3af);
}

.n-toast--primary {
  border-left: 3px solid var(--color-primary-500, #3b82f6);
}

.n-toast--success {
  border-left: 3px solid var(--color-success-500, #22c55e);
}

.n-toast--warning {
  border-left: 3px solid var(--color-warning-500, #f59e0b);
}

.n-toast--error {
  border-left: 3px solid var(--color-error-500, #ef4444);
}

.n-toast--info {
  border-left: 3px solid var(--color-info-500, #06b6d4);
}

.n-toast__content {
  flex: 1;
  min-width: 0;
}

.n-toast__title {
  margin: 0;
  font-size: var(--font-fontSize-sm, 0.875rem);
  font-weight: var(--font-fontWeight-semibold, 600);
  color: var(--color-neutral-900, #111827);
  line-height: 1.4;
}

.n-toast__description {
  margin-top: var(--spacing-1, 0.25rem);
  font-size: var(--font-fontSize-sm, 0.875rem);
  color: var(--color-neutral-600, #4b5563);
  line-height: 1.5;
}

.n-toast__close {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: var(--radius-sm, 0.25rem);
  background: transparent;
  color: var(--color-neutral-400, #9ca3af);
  cursor: pointer;
  transition: color var(--transition-fast, 150ms),
              background-color var(--transition-fast, 150ms);
}

.n-toast__close:hover {
  background-color: var(--color-neutral-100, #f3f4f6);
  color: var(--color-neutral-600, #4b5563);
}

.n-toast__close:focus-visible {
  outline: 2px solid var(--color-primary-500, #3b82f6);
  outline-offset: 2px;
}

@keyframes n-toast-slide-in {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes n-toast-fade-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

@keyframes n-toast-swipe-out {
  from {
    transform: translateX(var(--reka-toast-swipe-end-x));
  }
  to {
    transform: translateX(calc(100% + 1rem));
  }
}
</style>
