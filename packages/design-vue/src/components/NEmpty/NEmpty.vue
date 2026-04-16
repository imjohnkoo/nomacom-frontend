<template>
  <div class="n-empty">
    <slot>
      <div class="n-empty__icon-wrapper">
        <span v-if="icon" class="n-empty__icon">{{ icon }}</span>
        <svg
          v-else
          class="n-empty__icon n-empty__icon--default"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      </div>

      <h3 class="n-empty__title">{{ title }}</h3>

      <p v-if="description" class="n-empty__description">{{ description }}</p>
    </slot>

    <div v-if="$slots.actions" class="n-empty__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export interface NEmptyProps {
  title?: string
  description?: string
  icon?: string
}

export default defineComponent({
  name: 'NEmpty',

  props: {
    title: {
      type: String,
      default: '데이터가 없습니다',
    },
    description: {
      type: String,
      default: undefined,
    },
    icon: {
      type: String,
      default: undefined,
    },
  },
});
</script>

<style scoped>
.n-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-12) var(--spacing-6);
  text-align: center;
}

.n-empty__icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  margin-bottom: var(--spacing-4);
  border-radius: var(--radius-full);
  background-color: var(--color-neutral-100);
  color: var(--color-neutral-400);
}

.n-empty__icon {
  font-size: var(--font-fontSize-2xl);
  line-height: 1;
}

.n-empty__icon--default {
  width: 28px;
  height: 28px;
}

.n-empty__title {
  margin: 0 0 var(--spacing-1) 0;
  font-family: var(--font-fontFamily-sans);
  font-size: var(--font-fontSize-base);
  font-weight: var(--font-fontWeight-semibold);
  color: var(--color-neutral-700);
  line-height: 1.4;
}

.n-empty__description {
  margin: 0;
  max-width: 360px;
  font-family: var(--font-fontFamily-sans);
  font-size: var(--font-fontSize-sm);
  font-weight: var(--font-fontWeight-regular);
  color: var(--color-neutral-400);
  line-height: 1.6;
}

.n-empty__actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  margin-top: var(--spacing-5);
}
</style>
