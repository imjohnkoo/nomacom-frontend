<template>
  <button
    type="button"
    :class="['n-field-card', { 'n-field-card--active': active, 'n-field-card--error': error }]"
    :disabled="disabled"
    @click="handleClick"
  >
    <span class="n-field-card__label">{{ label }}</span>
    <span class="n-field-card__value">
      <span class="n-field-card__main">
        <slot>
          <span
            v-if="value"
            :class="['n-field-card__text', { 'n-field-card__placeholder': !value }]"
          >
            {{ value }}
          </span>
          <span v-else class="n-field-card__placeholder">{{ placeholder }}</span>
        </slot>
      </span>
      <span class="n-field-card__chev" aria-hidden="true">
        <slot name="chev">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.4"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </slot>
      </span>
    </span>
  </button>
</template>

<script setup lang="ts">
export interface NFieldCardProps {
  label: string
  value?: string | number
  placeholder?: string
  active?: boolean
  error?: boolean
  disabled?: boolean
}

withDefaults(defineProps<NFieldCardProps>(), {
  value: undefined,
  placeholder: '선택해 주세요',
  active: false,
  error: false,
  disabled: false,
})

const emit = defineEmits<{ click: [event: MouseEvent] }>()

function handleClick(e: MouseEvent) {
  emit('click', e)
}
</script>

<style scoped>
.n-field-card {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 16px;
  border: 1px solid #f1f1f4;
  border-radius: var(--radius-2xl, 1rem);
  background-color: var(--color-neutral-0, #ffffff);
  font-family: var(--font-fontFamily-sans, sans-serif);
  cursor: pointer;
  text-align: left;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease;
}

.n-field-card:hover:not(:disabled),
.n-field-card--active {
  border-color: var(--color-primary-300, #a78bff);
  box-shadow: 0 0 0 3px var(--color-primary-50, #f1edff);
}

.n-field-card--error {
  border-color: var(--color-error-500, #ef4444);
  box-shadow: 0 0 0 3px var(--color-error-50, #fef2f2);
}

.n-field-card:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.n-field-card__label {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-neutral-500, #737373);
  letter-spacing: 0.02em;
}

.n-field-card--active .n-field-card__label {
  color: var(--color-primary-500, #6239ff);
}

.n-field-card--error .n-field-card__label {
  color: var(--color-error-500, #ef4444);
}

.n-field-card__value {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 24px;
}

.n-field-card__main {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
  font-size: 15px;
  font-weight: 500;
  color: var(--color-neutral-900, #171717);
}

.n-field-card__placeholder {
  font-weight: 400;
  color: var(--color-neutral-400, #a3a3a3);
}

.n-field-card__chev {
  display: inline-flex;
  align-items: center;
  color: var(--color-neutral-400, #a3a3a3);
  flex-shrink: 0;
}
</style>
