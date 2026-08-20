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
  gap: var(--n-spacing-3, 0.75rem);
  width: 360px;
  max-width: 100vw;
  padding: var(--n-spacing-4, 1rem);
  border-radius: var(--n-radius-lg, 0.5rem);
  border: var(--n-border-width-1, 1px) solid var(--n-color-neutral-200, #e5e5e5);
  background-color: var(--n-color-neutral-0, #ffffff);
  box-shadow: var(--n-shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
  font-family: var(--n-font-family-sans, 'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Segoe UI', 'Noto Sans KR', sans-serif);
  animation: n-toast-slide-in var(--n-transition-normal, 250ms ease) ease;
}

.n-toast[data-swipe='move'] {
  transform: translateX(var(--reka-toast-swipe-move-x));
}

.n-toast[data-swipe='cancel'] {
  transform: translateX(0);
  transition: transform var(--n-transition-fast, 150ms ease) ease;
}

.n-toast[data-swipe='end'] {
  animation: n-toast-swipe-out var(--n-transition-fast, 150ms ease) ease forwards;
}

.n-toast[data-state='closed'] {
  animation: n-toast-fade-out var(--n-transition-fast, 150ms ease) ease forwards;
}

/* --- Color variants --- */
.n-toast--neutral {
  border-left: 3px solid var(--n-color-neutral-400, #a3a3a3);
}

.n-toast--primary {
  border-left: 3px solid var(--n-color-primary-500, #6239FF);
}

.n-toast--success {
  border-left: 3px solid var(--n-color-success-500, #22c55e);
}

.n-toast--warning {
  border-left: 3px solid var(--n-color-warning-500, #f59e0b);
}

.n-toast--error {
  border-left: 3px solid var(--n-color-error-500, #ef4444);
}

.n-toast--info {
  border-left: 3px solid var(--n-color-info-500, #0ea5e9);
}

.n-toast__content {
  flex: 1;
  min-width: 0;
}

.n-toast__title {
  margin: 0;
  font-size: var(--n-font-size-sm, 0.875rem);
  font-weight: var(--n-font-weight-semibold, 600);
  color: var(--n-color-neutral-900, #171717);
  line-height: 1.4;
}

.n-toast__description {
  margin-top: var(--n-spacing-1, 0.25rem);
  font-size: var(--n-font-size-sm, 0.875rem);
  color: var(--n-color-neutral-600, #525252);
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
  border-radius: var(--n-radius-sm, 0.25rem);
  background: transparent;
  color: var(--n-color-neutral-400, #a3a3a3);
  cursor: pointer;
  transition: color var(--n-transition-fast, 150ms ease),
              background-color var(--n-transition-fast, 150ms ease);
}

.n-toast__close:hover {
  background-color: var(--n-color-neutral-100, #f5f5f5);
  color: var(--n-color-neutral-600, #525252);
}

.n-toast__close:focus-visible {
  outline: 2px solid var(--n-color-primary-500, #6239FF);
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
