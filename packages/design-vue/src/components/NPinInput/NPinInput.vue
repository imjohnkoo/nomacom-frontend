<script setup lang="ts">
import { PinInputRoot, PinInputInput } from 'reka-ui'

export interface NPinInputProps {
  modelValue?: string[]
  length?: number
  type?: 'text' | 'number'
  disabled?: boolean
  placeholder?: string
}

const props = withDefaults(defineProps<NPinInputProps>(), {
  modelValue: () => [],
  length: 4,
  type: 'text',
  disabled: false,
  placeholder: '○',
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
  'complete': [value: string[]]
}>()

function handleUpdate(value: string[]) {
  emit('update:modelValue', value)
}

function handleComplete(value: string[]) {
  emit('complete', value)
}
</script>

<template>
  <PinInputRoot
    :model-value="modelValue"
    :disabled="disabled"
    :type="type"
    :placeholder="placeholder"
    :class="[
      'n-pin-input',
      { 'n-pin-input--disabled': disabled },
    ]"
    @update:model-value="handleUpdate"
    @complete="handleComplete"
  >
    <PinInputInput
      v-for="(_, index) in length"
      :key="index"
      :index="index"
      class="n-pin-input__field"
    />
  </PinInputRoot>
</template>

<style scoped>
.n-pin-input {
  display: inline-flex;
  gap: var(--spacing-2);
}

.n-pin-input--disabled {
  opacity: 0.5;
  pointer-events: none;
}

.n-pin-input__field {
  width: 44px;
  height: 44px;
  text-align: center;
  font-family: var(--font-fontFamily-sans);
  font-size: var(--font-fontSize-lg);
  font-weight: var(--font-fontWeight-semibold);
  color: var(--color-neutral-800);
  background-color: var(--color-neutral-0);
  border: var(--borderWidth-1) solid var(--color-neutral-300);
  border-radius: var(--radius-md);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  outline: none;
}

.n-pin-input__field::placeholder {
  color: var(--color-neutral-300);
}

.n-pin-input__field:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 2px var(--color-primary-50);
}

.n-pin-input__field[data-disabled] {
  background-color: var(--color-neutral-50);
  cursor: not-allowed;
}
</style>
