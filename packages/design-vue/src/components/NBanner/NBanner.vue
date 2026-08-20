<template>
  <div
    v-if="visible"
    :class="['n-banner', `n-banner--${color}`]"
    role="banner"
  >
    <div class="n-banner__inner">
      <span v-if="icon" :class="['n-banner__icon', 'n-icon', icon]" />
      <div class="n-banner__content">
        <span v-if="title" class="n-banner__title">{{ title }}</span>
        <span v-if="description" class="n-banner__description">{{ description }}</span>
      </div>
      <button
        v-if="closable"
        class="n-banner__close"
        type="button"
        aria-label="Close"
        @click="handleClose"
      >
        &times;
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { NColor } from '../../types/common'

export interface NBannerProps {
  title?: string
  description?: string
  color?: NColor
  closable?: boolean
  icon?: string
}

withDefaults(defineProps<NBannerProps>(), {
  title: undefined,
  description: undefined,
  color: 'primary',
  closable: false,
  icon: undefined,
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
.n-banner {
  width: 100%;
  font-family: var(--n-font-family-sans, 'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Segoe UI', 'Noto Sans KR', sans-serif);
}

.n-banner__inner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--n-spacing-3, 0.75rem);
  padding: var(--n-spacing-3, 0.75rem) var(--n-spacing-4, 1rem);
}

.n-banner__icon {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  font-size: var(--n-font-size-base, 1rem);
}

.n-banner__content {
  display: flex;
  align-items: center;
  gap: var(--n-spacing-2, 0.5rem);
  flex-wrap: wrap;
}

.n-banner__title {
  font-size: var(--n-font-size-sm, 0.875rem);
  font-weight: var(--n-font-weight-semibold, 600);
  line-height: var(--n-font-line-height-normal, 1.5);
}

.n-banner__description {
  font-size: var(--n-font-size-sm, 0.875rem);
  font-weight: var(--n-font-weight-normal, 400);
  line-height: var(--n-font-line-height-normal, 1.5);
}

.n-banner__close {
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
  opacity: 0.7;
  flex-shrink: 0;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: var(--n-radius-sm, 0.25rem);
  transition: opacity var(--n-transition-fast, 150ms ease);
  margin-left: auto;
}

.n-banner__close:hover {
  opacity: 1;
}

/* --- Color variants --- */
.n-banner--primary {
  background-color: var(--n-color-primary-600, #5025e8);
  color: var(--n-color-neutral-0, #ffffff);
}

.n-banner--neutral {
  background-color: var(--n-color-neutral-800, #262626);
  color: var(--n-color-neutral-0, #ffffff);
}

.n-banner--success {
  background-color: var(--n-color-success-500, #22c55e);
  color: var(--n-color-neutral-0, #ffffff);
}

.n-banner--warning {
  background-color: var(--n-color-warning-500, #f59e0b);
  color: var(--n-color-neutral-900, #171717);
}

.n-banner--error {
  background-color: var(--n-color-error-500, #ef4444);
  color: var(--n-color-neutral-0, #ffffff);
}

.n-banner--info {
  background-color: var(--n-color-info-500, #0ea5e9);
  color: var(--n-color-neutral-0, #ffffff);
}
</style>
