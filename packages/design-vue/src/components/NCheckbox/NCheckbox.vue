<script setup lang="ts">
import { computed } from 'vue'
import { CheckboxRoot, CheckboxIndicator } from 'reka-ui'

export interface NCheckboxProps {
  modelValue?: boolean
  label?: string
  disabled?: boolean
  indeterminate?: boolean
}

const props = withDefaults(defineProps<NCheckboxProps>(), {
  modelValue: false,
  disabled: false,
  indeterminate: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const checkedState = computed(() => {
  if (props.indeterminate) return 'indeterminate'
  return props.modelValue
})

function handleUpdate(value: boolean | 'indeterminate') {
  if (value === 'indeterminate') {
    emit('update:modelValue', true)
  } else {
    emit('update:modelValue', value)
  }
}
</script>

<template>
  <label
    :class="[
      'n-checkbox',
      { 'n-checkbox--disabled': disabled },
    ]"
  >
    <CheckboxRoot
      :checked="checkedState"
      :disabled="disabled"
      class="n-checkbox__control"
      @update:checked="handleUpdate"
    >
      <CheckboxIndicator class="n-checkbox__indicator">
        <svg
          v-if="!indeterminate"
          class="n-checkbox__check-icon"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2.5 6L5 8.5L9.5 3.5"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <svg
          v-else
          class="n-checkbox__check-icon"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2.5 6H9.5"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
      </CheckboxIndicator>
    </CheckboxRoot>
    <span v-if="label" class="n-checkbox__label">{{ label }}</span>
  </label>
</template>

<style scoped>
.n-checkbox {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  cursor: pointer;
  user-select: none;
}

.n-checkbox--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.n-checkbox__control {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border: var(--borderWidth-2) solid var(--color-neutral-300);
  border-radius: var(--radius-sm);
  background-color: var(--color-neutral-0);
  transition: all var(--transition-fast);
  flex-shrink: 0;
  cursor: inherit;
}

.n-checkbox__control:hover:not([data-disabled]) {
  border-color: var(--color-primary-500);
}

.n-checkbox__control:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

.n-checkbox__control[data-state='checked'],
.n-checkbox__control[data-state='indeterminate'] {
  background-color: var(--color-primary-500);
  border-color: var(--color-primary-500);
}

.n-checkbox__indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-neutral-0);
}

.n-checkbox__check-icon {
  display: block;
}

.n-checkbox__label {
  font-family: var(--font-fontFamily-sans);
  font-size: var(--font-fontSize-sm);
  font-weight: var(--font-fontWeight-regular);
  color: var(--color-neutral-800);
  line-height: 1.4;
}
</style>
