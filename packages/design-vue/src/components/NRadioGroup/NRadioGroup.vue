<script setup lang="ts">
import { RadioGroupRoot, RadioGroupItem, RadioGroupIndicator } from 'reka-ui'

export interface NRadioGroupItem {
  label: string
  value: string
  disabled?: boolean
}

export interface NRadioGroupProps {
  modelValue?: string
  items?: NRadioGroupItem[]
  orientation?: 'horizontal' | 'vertical'
}

withDefaults(defineProps<NRadioGroupProps>(), {
  modelValue: '',
  items: () => [],
  orientation: 'vertical',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <RadioGroupRoot
    :model-value="modelValue"
    :orientation="orientation"
    :class="[
      'n-radio-group',
      `n-radio-group--${orientation}`,
    ]"
    @update:model-value="emit('update:modelValue', $event as string)"
  >
    <label
      v-for="item in items"
      :key="item.value"
      :class="[
        'n-radio-group__item',
        { 'n-radio-group__item--disabled': item.disabled },
      ]"
    >
      <RadioGroupItem
        :value="item.value"
        :disabled="item.disabled"
        class="n-radio-group__control"
      >
        <RadioGroupIndicator class="n-radio-group__indicator" />
      </RadioGroupItem>
      <span class="n-radio-group__label">{{ item.label }}</span>
    </label>
  </RadioGroupRoot>
</template>

<style scoped>
.n-radio-group {
  display: flex;
  gap: var(--spacing-3);
}

.n-radio-group--vertical {
  flex-direction: column;
}

.n-radio-group--horizontal {
  flex-direction: row;
  flex-wrap: wrap;
}

.n-radio-group__item {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  cursor: pointer;
  user-select: none;
}

.n-radio-group__item--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.n-radio-group__control {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: var(--radius-full);
  border: var(--borderWidth-2) solid var(--color-neutral-300);
  background-color: var(--color-neutral-0);
  cursor: inherit;
  flex-shrink: 0;
  transition: border-color var(--transition-fast);
  padding: 0;
}

.n-radio-group__control:hover:not([data-disabled]) {
  border-color: var(--color-primary-500);
}

.n-radio-group__control:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

.n-radio-group__control[data-state='checked'] {
  border-color: var(--color-primary-500);
}

.n-radio-group__indicator {
  display: block;
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background-color: var(--color-primary-500);
}

.n-radio-group__label {
  font-family: var(--font-fontFamily-sans);
  font-size: var(--font-fontSize-sm);
  font-weight: var(--font-fontWeight-regular);
  color: var(--color-neutral-800);
  line-height: 1.4;
}
</style>
