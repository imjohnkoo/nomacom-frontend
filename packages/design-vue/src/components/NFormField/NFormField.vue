<template>
  <div
    :class="[
      'n-form-field',
      {
        'n-form-field--disabled': isDisabled,
        'n-form-field--error': !!error,
        'n-form-field--required': required,
      },
    ]"
  >
    <label v-if="label || $slots.label" :for="fieldId" class="n-form-field__label">
      <slot name="label">
        {{ label }}
      </slot>
      <span v-if="required" class="n-form-field__required" aria-hidden="true">*</span>
    </label>

    <div class="n-form-field__control">
      <slot />
    </div>

    <p v-if="hint && !error" class="n-form-field__hint">
      <slot name="hint">
        {{ hint }}
      </slot>
    </p>

    <p v-if="error" class="n-form-field__error" role="alert">
      <slot name="error">
        {{ error }}
      </slot>
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, toRef } from 'vue'
import { useId, provideFormField, useForm } from '../../composables'

export interface NFormFieldProps {
  label?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<NFormFieldProps>(), {
  label: undefined,
  hint: undefined,
  error: undefined,
  required: false,
  disabled: false,
})

const fieldId = useId('n-field')
const formContext = useForm()

const isDisabled = computed(() => props.disabled || formContext?.disabled.value || false)

provideFormField({
  id: fieldId,
  error: toRef(props, 'error'),
  disabled: toRef(() => isDisabled.value),
  required: toRef(props, 'required'),
})
</script>

<style scoped>
.n-form-field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1, 0.25rem);
  width: 100%;
}

/* --- Label --- */
.n-form-field__label {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1, 0.25rem);
  font-family: var(--font-fontFamily-sans, sans-serif);
  font-size: var(--font-fontSize-sm, 0.875rem);
  font-weight: var(--font-fontWeight-medium, 500);
  line-height: var(--font-lineHeight-normal, 1.5);
  color: var(--color-neutral-700, #404040);
}

.n-form-field--disabled .n-form-field__label {
  color: var(--color-neutral-400, #a3a3a3);
}

/* --- Required indicator --- */
.n-form-field__required {
  color: var(--color-error-500, #ef4444);
  font-weight: var(--font-fontWeight-bold, 700);
}

/* --- Hint --- */
.n-form-field__hint {
  margin: 0;
  font-family: var(--font-fontFamily-sans, sans-serif);
  font-size: var(--font-fontSize-xs, 0.75rem);
  line-height: var(--font-lineHeight-normal, 1.5);
  color: var(--color-neutral-500, #737373);
}

/* --- Error --- */
.n-form-field__error {
  margin: 0;
  font-family: var(--font-fontFamily-sans, sans-serif);
  font-size: var(--font-fontSize-xs, 0.75rem);
  line-height: var(--font-lineHeight-normal, 1.5);
  color: var(--color-error-500, #ef4444);
}

/* --- Control wrapper --- */
.n-form-field__control {
  display: flex;
  flex-direction: column;
}
</style>
