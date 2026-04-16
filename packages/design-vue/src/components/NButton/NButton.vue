<template>
  <button
    :class="[
      'n-button',
      `n-button--${variant}`,
      `n-button--${size}`,
      {
        'n-button--full-width': fullWidth,
        'n-button--loading': loading,
        'n-button--disabled': disabled,
      },
    ]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span v-if="loading" class="n-button__spinner" />
    <span v-if="$slots['icon-left'] && !loading" class="n-button__icon n-button__icon--left">
      <slot name="icon-left" />
    </span>
    <span class="n-button__content">
      <slot />
    </span>
    <span v-if="$slots['icon-right']" class="n-button__icon n-button__icon--right">
      <slot name="icon-right" />
    </span>
  </button>
</template>

<script setup lang="ts">
export interface NButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
}

const props = withDefaults(defineProps<NButtonProps>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  fullWidth: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

function handleClick(event: MouseEvent) {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
.n-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2, 0.5rem);
  border: var(--borderWidth-1, 1px) solid transparent;
  border-radius: var(--radius-md, 0.375rem);
  font-family: var(--font-fontFamily-sans, sans-serif);
  font-weight: var(--font-fontWeight-medium, 500);
  line-height: var(--font-lineHeight-normal, 1.5);
  cursor: pointer;
  transition: all var(--transition-fast, 150ms ease);
  outline: none;
  text-decoration: none;
  white-space: nowrap;
  user-select: none;
}

.n-button:focus-visible {
  box-shadow: 0 0 0 2px var(--color-primary-200, #ddd6fe);
}

/* --- Sizes --- */
.n-button--sm {
  padding: var(--spacing-1, 0.25rem) var(--spacing-3, 0.75rem);
  font-size: var(--font-fontSize-sm, 0.875rem);
}

.n-button--md {
  padding: var(--spacing-2, 0.5rem) var(--spacing-4, 1rem);
  font-size: var(--font-fontSize-base, 1rem);
}

.n-button--lg {
  padding: var(--spacing-3, 0.75rem) var(--spacing-6, 1.5rem);
  font-size: var(--font-fontSize-lg, 1.125rem);
}

/* --- Variants --- */
.n-button--primary {
  background-color: var(--color-primary-600, #5530e6);
  color: var(--color-neutral-0, #ffffff);
}
.n-button--primary:hover:not(:disabled) {
  background-color: var(--color-primary-700, #4826cc);
}
.n-button--primary:active:not(:disabled) {
  background-color: var(--color-primary-800, #3b1db3);
}

.n-button--secondary {
  background-color: var(--color-neutral-100, #f5f5f5);
  color: var(--color-neutral-800, #262626);
}
.n-button--secondary:hover:not(:disabled) {
  background-color: var(--color-neutral-200, #e5e5e5);
}
.n-button--secondary:active:not(:disabled) {
  background-color: var(--color-neutral-300, #d4d4d4);
}

.n-button--outline {
  background-color: transparent;
  border-color: var(--color-neutral-300, #d4d4d4);
  color: var(--color-neutral-800, #262626);
}
.n-button--outline:hover:not(:disabled) {
  background-color: var(--color-neutral-50, #fafafa);
  border-color: var(--color-neutral-400, #a3a3a3);
}

.n-button--ghost {
  background-color: transparent;
  color: var(--color-neutral-700, #404040);
}
.n-button--ghost:hover:not(:disabled) {
  background-color: var(--color-neutral-100, #f5f5f5);
}

.n-button--danger {
  background-color: var(--color-error-500, #ef4444);
  color: var(--color-neutral-0, #ffffff);
}
.n-button--danger:hover:not(:disabled) {
  background-color: var(--color-error-700, #b91c1c);
}

/* --- States --- */
.n-button--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.n-button--loading {
  cursor: wait;
}

.n-button--full-width {
  width: 100%;
}

/* --- Spinner --- */
.n-button__spinner {
  display: inline-block;
  width: 1em;
  height: 1em;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: n-spin 0.6s linear infinite;
}

@keyframes n-spin {
  to {
    transform: rotate(360deg);
  }
}

/* --- Icon --- */
.n-button__icon {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}
</style>
