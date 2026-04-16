<script setup lang="ts">
import {
  NumberFieldRoot,
  NumberFieldInput,
  NumberFieldIncrement,
  NumberFieldDecrement,
} from 'reka-ui'

export interface NInputNumberProps {
  modelValue?: number
  min?: number
  max?: number
  step?: number
  disabled?: boolean
}

withDefaults(defineProps<NInputNumberProps>(), {
  modelValue: 0,
  step: 1,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()
</script>

<template>
  <NumberFieldRoot
    :model-value="modelValue"
    :min="min"
    :max="max"
    :step="step"
    :disabled="disabled"
    :class="[
      'n-input-number',
      { 'n-input-number--disabled': disabled },
    ]"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <NumberFieldDecrement class="n-input-number__button n-input-number__button--decrement">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 7H11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      </svg>
    </NumberFieldDecrement>
    <NumberFieldInput class="n-input-number__input" />
    <NumberFieldIncrement class="n-input-number__button n-input-number__button--increment">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 3V11M3 7H11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      </svg>
    </NumberFieldIncrement>
  </NumberFieldRoot>
</template>

<style scoped>
.n-input-number {
  display: inline-flex;
  align-items: center;
  border: var(--borderWidth-1) solid var(--color-neutral-300);
  border-radius: var(--radius-md);
  overflow: hidden;
  background-color: var(--color-neutral-0);
  transition: border-color var(--transition-fast);
}

.n-input-number:focus-within {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 2px var(--color-primary-50);
}

.n-input-number--disabled {
  opacity: 0.5;
  pointer-events: none;
  background-color: var(--color-neutral-50);
}

.n-input-number__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background-color: var(--color-neutral-50);
  color: var(--color-neutral-600);
  cursor: pointer;
  flex-shrink: 0;
  transition: background-color var(--transition-fast), color var(--transition-fast);
}

.n-input-number__button:hover:not([disabled]) {
  background-color: var(--color-neutral-100);
  color: var(--color-neutral-800);
}

.n-input-number__button:active:not([disabled]) {
  background-color: var(--color-neutral-200);
}

.n-input-number__button[disabled] {
  color: var(--color-neutral-300);
  cursor: not-allowed;
}

.n-input-number__input {
  width: 64px;
  height: 36px;
  text-align: center;
  font-family: var(--font-fontFamily-sans);
  font-size: var(--font-fontSize-sm);
  font-weight: var(--font-fontWeight-medium);
  color: var(--color-neutral-800);
  border: none;
  border-left: var(--borderWidth-1) solid var(--color-neutral-200);
  border-right: var(--borderWidth-1) solid var(--color-neutral-200);
  background-color: transparent;
  outline: none;
  -moz-appearance: textfield;
}

.n-input-number__input::-webkit-inner-spin-button,
.n-input-number__input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
