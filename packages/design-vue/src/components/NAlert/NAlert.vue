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
  gap: var(--spacing-3, 0.75rem);
  padding: var(--spacing-4, 1rem);
  border-radius: var(--radius-lg, 0.5rem);
  border: var(--borderWidth-1, 1px) solid transparent;
  font-family: var(--font-fontFamily-sans, sans-serif);
}

.n-alert__icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  font-size: var(--font-fontSize-lg, 1.125rem);
}

.n-alert__content {
  flex: 1;
  min-width: 0;
}

.n-alert__title {
  font-size: var(--font-fontSize-sm, 0.875rem);
  font-weight: var(--font-fontWeight-semibold, 600);
  line-height: var(--font-lineHeight-normal, 1.5);
}

.n-alert__description {
  font-size: var(--font-fontSize-sm, 0.875rem);
  font-weight: var(--font-fontWeight-regular, 400);
  line-height: var(--font-lineHeight-normal, 1.5);
  margin-top: var(--spacing-1, 0.25rem);
}

.n-alert__title + .n-alert__description {
  margin-top: var(--spacing-1, 0.25rem);
}

.n-alert__actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-2, 0.5rem);
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
  font-size: var(--font-fontSize-lg, 1.125rem);
  line-height: 1;
  color: inherit;
  opacity: 0.6;
  flex-shrink: 0;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: var(--radius-sm, 0.25rem);
  transition: opacity var(--transition-fast, 150ms ease);
}

.n-alert__close:hover {
  opacity: 1;
}

/* --- Color variants --- */
.n-alert--primary {
  background-color: var(--color-primary-50, #eff6ff);
  border-color: var(--color-primary-200, #bfdbfe);
  color: var(--color-primary-800, #1e40af);
}

.n-alert--neutral {
  background-color: var(--color-neutral-50, #fafafa);
  border-color: var(--color-neutral-200, #e5e5e5);
  color: var(--color-neutral-800, #262626);
}

.n-alert--success {
  background-color: var(--color-success-50, #f0fdf4);
  border-color: var(--color-success-500, #22c55e);
  color: var(--color-success-700, #15803d);
}

.n-alert--warning {
  background-color: var(--color-warning-50, #fffbeb);
  border-color: var(--color-warning-500, #f59e0b);
  color: var(--color-warning-700, #b45309);
}

.n-alert--error {
  background-color: var(--color-error-50, #fef2f2);
  border-color: var(--color-error-500, #ef4444);
  color: var(--color-error-700, #b91c1c);
}

.n-alert--info {
  background-color: var(--color-info-50, #eff6ff);
  border-color: var(--color-info-500, #3b82f6);
  color: var(--color-info-700, #1d4ed8);
}
</style>
