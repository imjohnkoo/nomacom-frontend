<template>
  <div
    :class="[
      'n-textarea',
      `n-textarea--${size}`,
      {
        'n-textarea--disabled': isDisabled,
        'n-textarea--readonly': readonly,
        'n-textarea--error': hasError,
      },
    ]"
  >
    <textarea
      :id="fieldContext?.id"
      class="n-textarea__field"
      :value="modelValue"
      :placeholder="placeholder"
      :rows="rows"
      :disabled="isDisabled"
      :readonly="readonly"
      :required="fieldContext?.required?.value || false"
      :aria-invalid="hasError || undefined"
      :aria-describedby="ariaDescribedBy"
      :style="{ resize }"
      @input="handleInput"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFormField } from '../../composables'

export interface NTextareaProps {
  modelValue?: string
  placeholder?: string
  rows?: number
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  readonly?: boolean
  resize?: 'none' | 'vertical' | 'both'
  error?: boolean
}

const props = withDefaults(defineProps<NTextareaProps>(), {
  modelValue: undefined,
  placeholder: undefined,
  rows: 3,
  size: 'md',
  disabled: false,
  readonly: false,
  resize: 'vertical',
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
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}
</script>

<style scoped>
.n-textarea {
  display: inline-flex;
  width: 100%;
  border: var(--borderWidth-1, 1px) solid var(--color-neutral-300, #d4d4d4);
  border-radius: var(--radius-md, 0.375rem);
  background-color: var(--color-neutral-0, #ffffff);
  font-family: var(--font-fontFamily-sans, sans-serif);
  transition: border-color var(--transition-fast, 150ms ease),
    box-shadow var(--transition-fast, 150ms ease);
}

.n-textarea:focus-within {
  border-color: var(--color-primary-500, #3b82f6);
  box-shadow: 0 0 0 2px var(--color-primary-200, #bfdbfe);
}

/* --- Sizes --- */
.n-textarea--sm {
  font-size: var(--font-fontSize-sm, 0.875rem);
}

.n-textarea--sm .n-textarea__field {
  padding: var(--spacing-1, 0.25rem) var(--spacing-2, 0.5rem);
}

.n-textarea--md {
  font-size: var(--font-fontSize-base, 1rem);
}

.n-textarea--md .n-textarea__field {
  padding: var(--spacing-2, 0.5rem) var(--spacing-3, 0.75rem);
}

.n-textarea--lg {
  font-size: var(--font-fontSize-lg, 1.125rem);
}

.n-textarea--lg .n-textarea__field {
  padding: var(--spacing-3, 0.75rem) var(--spacing-4, 1rem);
}

/* --- Field --- */
.n-textarea__field {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  font: inherit;
  color: var(--color-neutral-900, #171717);
  line-height: var(--font-lineHeight-normal, 1.5);
}

.n-textarea__field::placeholder {
  color: var(--color-neutral-400, #a3a3a3);
}

/* --- Error --- */
.n-textarea--error {
  border-color: var(--color-error-500, #ef4444);
}

.n-textarea--error:focus-within {
  border-color: var(--color-error-500, #ef4444);
  box-shadow: 0 0 0 2px var(--color-error-50, #fef2f2);
}

/* --- Disabled --- */
.n-textarea--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: var(--color-neutral-50, #fafafa);
}

.n-textarea--disabled .n-textarea__field {
  cursor: not-allowed;
}

/* --- Readonly --- */
.n-textarea--readonly {
  background-color: var(--color-neutral-50, #fafafa);
}
</style>
