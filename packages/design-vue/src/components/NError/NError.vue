<template>
  <div class="n-error">
    <div class="n-error__icon-wrapper">
      <span v-if="icon" class="n-error__icon">{{ icon }}</span>
      <svg
        v-else
        class="n-error__icon n-error__icon--default"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    </div>

    <h2 class="n-error__title">{{ title }}</h2>

    <p v-if="description" class="n-error__description">{{ description }}</p>

    <button
      v-if="showRetry"
      class="n-error__retry"
      type="button"
      @click="$emit('retry')"
    >
      {{ retryLabel }}
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export interface NErrorProps {
  title?: string
  description?: string
  icon?: string
  retryLabel?: string
  showRetry?: boolean
}

export default defineComponent({
  name: 'NError',

  props: {
    title: {
      type: String,
      default: '오류가 발생했습니다',
    },
    description: {
      type: String,
      default: undefined,
    },
    icon: {
      type: String,
      default: undefined,
    },
    retryLabel: {
      type: String,
      default: '다시 시도',
    },
    showRetry: {
      type: Boolean,
      default: true,
    },
  },

  emits: ['retry'],
});
</script>

<style scoped>
.n-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-12) var(--spacing-6);
  text-align: center;
}

.n-error__icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  margin-bottom: var(--spacing-5);
  border-radius: var(--radius-full);
  background-color: var(--color-error-50);
  color: var(--color-error-500);
}

.n-error__icon {
  font-size: var(--font-fontSize-2xl);
  line-height: 1;
}

.n-error__icon--default {
  width: 32px;
  height: 32px;
}

.n-error__title {
  margin: 0 0 var(--spacing-2) 0;
  font-family: var(--font-fontFamily-sans);
  font-size: var(--font-fontSize-xl);
  font-weight: var(--font-fontWeight-semibold);
  color: var(--color-neutral-900);
  line-height: 1.4;
}

.n-error__description {
  margin: 0 0 var(--spacing-6) 0;
  max-width: 420px;
  font-family: var(--font-fontFamily-sans);
  font-size: var(--font-fontSize-sm);
  font-weight: var(--font-fontWeight-regular);
  color: var(--color-neutral-500);
  line-height: 1.6;
}

.n-error__retry {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2) var(--spacing-5);
  border: var(--borderWidth-1) solid transparent;
  border-radius: var(--radius-md);
  background-color: var(--color-error-500);
  color: var(--color-neutral-0);
  font-family: var(--font-fontFamily-sans);
  font-size: var(--font-fontSize-sm);
  font-weight: var(--font-fontWeight-medium);
  cursor: pointer;
  transition: background-color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.n-error__retry:hover {
  background-color: var(--color-error-700);
}

.n-error__retry:focus-visible {
  outline: 2px solid var(--color-error-500);
  outline-offset: 2px;
}

.n-error__retry:active {
  transform: scale(0.98);
}
</style>
