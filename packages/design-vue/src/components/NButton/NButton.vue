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
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg' | 'xl'
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
  gap: var(--n-spacing-2, 0.5rem);
  border: var(--n-border-width-1, 1px) solid transparent;
  /* 사이즈 불문 동일 굴곡 — xl CTA 와 통일 (john 피드백) */
  border-radius: var(--n-radius-2xl, 1rem);
  font-family: var(--n-font-family-sans, 'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Segoe UI', 'Noto Sans KR', sans-serif);
  font-weight: var(--n-font-weight-medium, 500);
  line-height: var(--n-font-line-height-normal, 1.5);
  cursor: pointer;
  transition: all var(--n-transition-fast, 150ms ease);
  outline: none;
  text-decoration: none;
  white-space: nowrap;
  user-select: none;
}

.n-button:focus-visible {
  box-shadow: 0 0 0 2px var(--n-color-primary-200, #c7b6ff);
}

/* --- Sizes --- */
.n-button--sm {
  padding: var(--n-spacing-1, 0.25rem) var(--n-spacing-3, 0.75rem);
  font-size: var(--n-font-size-sm, 0.875rem);
}

.n-button--md {
  padding: var(--n-spacing-2, 0.5rem) var(--n-spacing-4, 1rem);
  font-size: var(--n-font-size-base, 1rem);
}

.n-button--lg {
  padding: var(--n-spacing-3, 0.75rem) var(--n-spacing-6, 1.5rem);
  font-size: var(--n-font-size-lg, 1.125rem);
}

/* CTA 사이즈 — sticky 하단 보라 그림자 포함, 토스풍 */
.n-button--xl {
  height: 56px;
  padding: 0 var(--n-spacing-6, 1.5rem);
  font-size: 16px;
  font-weight: var(--n-font-weight-semibold, 600);
}

.n-button--xl.n-button--primary {
  box-shadow: var(--n-shadow-cta-brand, 0 10px 24px -10px rgba(98, 57, 255, 0.5));
}

/* --- Variants --- */
.n-button--primary {
  background-color: var(--n-color-primary-500, #6239ff);
  color: var(--n-color-neutral-0, #ffffff);
}
.n-button--primary:hover:not(:disabled) {
  background-color: var(--n-color-primary-600, #5025e8);
}
.n-button--primary:active:not(:disabled) {
  background-color: var(--n-color-primary-700, #3f1cc0);
}

.n-button--secondary {
  background-color: var(--n-color-neutral-100, #f5f5f5);
  color: var(--n-color-neutral-800, #262626);
}
.n-button--secondary:hover:not(:disabled) {
  background-color: var(--n-color-neutral-200, #e5e5e5);
}
.n-button--secondary:active:not(:disabled) {
  background-color: var(--n-color-neutral-300, #d4d4d4);
}

/* soft 초록 — NStatusPill success 와 동일 톤 (발급완료/주문완료 계열 액션) */
.n-button--success {
  background-color: var(--n-color-success-50, #f0fdf4);
  color: var(--n-color-success-700, #15803d);
}
.n-button--success:hover:not(:disabled) {
  background-color: var(--n-color-success-100, #dcfce7);
}
.n-button--success:active:not(:disabled) {
  background-color: var(--n-color-success-200, #bbf7d0);
}

.n-button--outline {
  background-color: transparent;
  border-color: var(--n-color-neutral-300, #d4d4d4);
  color: var(--n-color-neutral-800, #262626);
}
.n-button--outline:hover:not(:disabled) {
  background-color: var(--n-color-neutral-50, #fafafa);
  border-color: var(--n-color-neutral-400, #a3a3a3);
}

.n-button--ghost {
  background-color: transparent;
  color: var(--n-color-neutral-700, #404040);
}
.n-button--ghost:hover:not(:disabled) {
  background-color: var(--n-color-neutral-100, #f5f5f5);
}

.n-button--danger {
  background-color: var(--n-color-error-500, #ef4444);
  color: var(--n-color-neutral-0, #ffffff);
}
.n-button--danger:hover:not(:disabled) {
  background-color: var(--n-color-error-700, #b91c1c);
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
