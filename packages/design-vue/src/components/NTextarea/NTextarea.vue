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
      v-bind="$attrs"
      @input="handleInput"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFormField } from '../../composables'

/**
 * 루트가 래퍼 `<div>` 라서 기본 동작이면 `maxlength`·`name`·`autocomplete` 같은
 * 네이티브 속성이 래퍼로 떨어져 무증상으로 무시된다. `<textarea>` 로 직접 전달한다.
 */
defineOptions({ inheritAttrs: false })

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
  border: var(--n-border-width-1, 1px) solid var(--n-color-neutral-300, #d4d4d4);
  border-radius: var(--n-radius-md, 0.375rem);
  background-color: var(--n-color-neutral-0, #ffffff);
  font-family: var(--n-font-family-sans, 'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Segoe UI', 'Noto Sans KR', sans-serif);
  transition: border-color var(--n-transition-fast, 150ms ease),
    box-shadow var(--n-transition-fast, 150ms ease);
}

.n-textarea:focus-within {
  border-color: var(--n-color-primary-500, #6239FF);
  box-shadow: 0 0 0 2px var(--n-color-primary-200, #c7b6ff);
}

/* --- Sizes --- */
.n-textarea--sm {
  font-size: var(--n-font-size-sm, 0.875rem);
}

.n-textarea--sm .n-textarea__field {
  padding: var(--n-spacing-1, 0.25rem) var(--n-spacing-2, 0.5rem);
}

.n-textarea--md {
  font-size: var(--n-font-size-base, 1rem);
}

.n-textarea--md .n-textarea__field {
  padding: var(--n-spacing-2, 0.5rem) var(--n-spacing-3, 0.75rem);
}

.n-textarea--lg {
  font-size: var(--n-font-size-lg, 1.125rem);
}

.n-textarea--lg .n-textarea__field {
  padding: var(--n-spacing-3, 0.75rem) var(--n-spacing-4, 1rem);
}

/* --- Field --- */
.n-textarea__field {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  font: inherit;
  color: var(--n-color-neutral-900, #171717);
  line-height: var(--n-font-line-height-normal, 1.5);
}

.n-textarea__field::placeholder {
  color: var(--n-color-neutral-400, #a3a3a3);
}

/* --- Error --- */
.n-textarea--error {
  border-color: var(--n-color-error-500, #ef4444);
}

.n-textarea--error:focus-within {
  border-color: var(--n-color-error-500, #ef4444);
  box-shadow: 0 0 0 2px var(--n-color-error-50, #fef2f2);
}

/* --- Disabled --- */
.n-textarea--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: var(--n-color-neutral-50, #fafafa);
}

.n-textarea--disabled .n-textarea__field {
  cursor: not-allowed;
}

/* --- Readonly --- */
.n-textarea--readonly {
  background-color: var(--n-color-neutral-50, #fafafa);
}
</style>
