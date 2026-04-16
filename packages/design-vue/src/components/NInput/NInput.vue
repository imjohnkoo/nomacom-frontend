<template>
  <div
    :class="[
      'n-input',
      `n-input--${size}`,
      {
        'n-input--disabled': isDisabled,
        'n-input--readonly': readonly,
        'n-input--error': hasError,
        'n-input--has-icon': !!icon,
      },
    ]"
  >
    <span v-if="icon" class="n-input__icon" aria-hidden="true">
      {{ icon }}
    </span>
    <input
      :id="fieldContext?.id"
      class="n-input__field"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="isDisabled"
      :readonly="readonly"
      :required="fieldContext?.required?.value || false"
      :aria-invalid="hasError || undefined"
      :aria-describedby="ariaDescribedBy"
      @input="handleInput"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFormField } from '../../composables'

export interface NInputProps {
  modelValue?: string
  placeholder?: string
  type?: string
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  readonly?: boolean
  icon?: string
  error?: boolean
}

const props = withDefaults(defineProps<NInputProps>(), {
  modelValue: undefined,
  placeholder: undefined,
  type: 'text',
  size: 'md',
  disabled: false,
  readonly: false,
  icon: undefined,
  error: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const fieldContext = useFormField()

const isDisabled = computed(() => props.disabled || fieldContext?.disabled?.value || false)

const hasError = computed(() => props.error || !!fieldContext?.error?.value)

const ariaDescribedBy = computed(() => {
  if (!fieldContext?.id) return undefined
  const parts: string[] = []
  if (fieldContext.error?.value) parts.push(`${fieldContext.id}-error`)
  return parts.length > 0 ? parts.join(' ') : undefined
})

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<style scoped>
.n-input {
  display: inline-flex;
  align-items: center;
  width: 100%;
  border: var(--borderWidth-1, 1px) solid var(--color-neutral-300, #d4d4d4);
  border-radius: var(--radius-md, 0.375rem);
  background-color: var(--color-neutral-0, #ffffff);
  font-family: var(--font-fontFamily-sans, sans-serif);
  transition: border-color var(--transition-fast, 150ms ease),
    box-shadow var(--transition-fast, 150ms ease);
}

.n-input:focus-within {
  border-color: var(--color-primary-500, #3b82f6);
  box-shadow: 0 0 0 2px var(--color-primary-200, #bfdbfe);
}

/* --- Sizes --- */
.n-input--sm {
  font-size: var(--font-fontSize-sm, 0.875rem);
}

.n-input--sm .n-input__field {
  padding: var(--spacing-1, 0.25rem) var(--spacing-2, 0.5rem);
}

.n-input--md {
  font-size: var(--font-fontSize-base, 1rem);
}

.n-input--md .n-input__field {
  padding: var(--spacing-2, 0.5rem) var(--spacing-3, 0.75rem);
}

.n-input--lg {
  font-size: var(--font-fontSize-lg, 1.125rem);
}

.n-input--lg .n-input__field {
  padding: var(--spacing-3, 0.75rem) var(--spacing-4, 1rem);
}

/* --- Field --- */
.n-input__field {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  font: inherit;
  color: var(--color-neutral-900, #171717);
  line-height: var(--font-lineHeight-normal, 1.5);
}

.n-input__field::placeholder {
  color: var(--color-neutral-400, #a3a3a3);
}

/* --- Icon --- */
.n-input__icon {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  color: var(--color-neutral-400, #a3a3a3);
}

.n-input--sm .n-input__icon {
  padding-left: var(--spacing-2, 0.5rem);
}

.n-input--md .n-input__icon {
  padding-left: var(--spacing-3, 0.75rem);
}

.n-input--lg .n-input__icon {
  padding-left: var(--spacing-4, 1rem);
}

/* --- Error --- */
.n-input--error {
  border-color: var(--color-error-500, #ef4444);
}

.n-input--error:focus-within {
  border-color: var(--color-error-500, #ef4444);
  box-shadow: 0 0 0 2px var(--color-error-50, #fef2f2);
}

/* --- Disabled --- */
.n-input--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: var(--color-neutral-50, #fafafa);
}

.n-input--disabled .n-input__field {
  cursor: not-allowed;
}

/* --- Readonly --- */
.n-input--readonly {
  background-color: var(--color-neutral-50, #fafafa);
}
</style>
