<template>
  <div
    v-if="visible"
    :class="['n-alert', `n-alert--${color}`]"
    role="alert"
  >
    <div v-if="$slots.icon || icon" class="n-alert__icon">
      <slot name="icon">
        <span :class="['n-icon', icon]" />
      </slot>
    </div>
    <div class="n-alert__content">
      <div v-if="title" class="n-alert__title">{{ title }}</div>
      <div v-if="$slots.default || description" class="n-alert__description">
        <slot>{{ description }}</slot>
      </div>
    </div>
    <div v-if="$slots.actions" class="n-alert__actions">
      <slot name="actions" />
    </div>
    <button
      v-if="closable"
      class="n-alert__close"
      type="button"
      aria-label="Close"
      @click="handleClose"
    >
      &times;
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { NColor } from '../../types/common'

export interface NAlertProps {
  title?: string
  description?: string
  color?: NColor
  icon?: string
  closable?: boolean
}

withDefaults(defineProps<NAlertProps>(), {
  title: undefined,
  description: undefined,
  color: 'info',
  icon: undefined,
  closable: false,
})

const emit = defineEmits<{
  close: []
}>()

const visible = ref(true)

function handleClose() {
  visible.value = false
  emit('close')
}
</script>

<style scoped>
.n-alert {
  display: flex;
  align-items: flex-start;
  gap: var(--n-spacing-3, 0.75rem);
  padding: var(--n-spacing-4, 1rem);
  border-radius: var(--n-radius-lg, 0.5rem);
  border: var(--n-border-width-1, 1px) solid transparent;
  font-family: var(--n-font-family-sans, 'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Segoe UI', 'Noto Sans KR', sans-serif);
}

.n-alert__icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  font-size: var(--n-font-size-lg, 1.125rem);
}

.n-alert__content {
  flex: 1;
  min-width: 0;
}

.n-alert__title {
  font-size: var(--n-font-size-sm, 0.875rem);
  font-weight: var(--n-font-weight-semibold, 600);
  line-height: var(--n-font-line-height-normal, 1.5);
}

.n-alert__description {
  font-size: var(--n-font-size-sm, 0.875rem);
  font-weight: var(--n-font-weight-normal, 400);
  line-height: var(--n-font-line-height-normal, 1.5);
  margin-top: var(--n-spacing-1, 0.25rem);
}

.n-alert__title + .n-alert__description {
  margin-top: var(--n-spacing-1, 0.25rem);
}

.n-alert__actions {
  display: flex;
  align-items: center;
  gap: var(--n-spacing-2, 0.5rem);
  flex-shrink: 0;
}

.n-alert__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
  font-size: var(--n-font-size-lg, 1.125rem);
  line-height: 1;
  color: inherit;
  opacity: 0.6;
  flex-shrink: 0;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: var(--n-radius-sm, 0.25rem);
  transition: opacity var(--n-transition-fast, 150ms ease);
}

.n-alert__close:hover {
  opacity: 1;
}

/* --- Color variants --- */
.n-alert--primary {
  background-color: var(--n-color-primary-50, #f1edff);
  border-color: var(--n-color-primary-200, #c7b6ff);
  color: var(--n-color-primary-800, #2f1499);
}

.n-alert--neutral {
  background-color: var(--n-color-neutral-50, #fafafa);
  border-color: var(--n-color-neutral-200, #e5e5e5);
  color: var(--n-color-neutral-800, #262626);
}

.n-alert--success {
  background-color: var(--n-color-success-50, #f0fdf4);
  border-color: var(--n-color-success-500, #22c55e);
  color: var(--n-color-success-700, #15803d);
}

.n-alert--warning {
  background-color: var(--n-color-warning-50, #fffbeb);
  border-color: var(--n-color-warning-500, #f59e0b);
  color: var(--n-color-warning-700, #b45309);
}

.n-alert--error {
  background-color: var(--n-color-error-50, #fef2f2);
  border-color: var(--n-color-error-500, #ef4444);
  color: var(--n-color-error-700, #b91c1c);
}

.n-alert--info {
  background-color: var(--n-color-info-50, #f0f9ff);
  border-color: var(--n-color-info-500, #0ea5e9);
  color: var(--n-color-info-700, #0369a1);
}
</style>
