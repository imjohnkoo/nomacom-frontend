<script setup lang="ts">
import {
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectPortal,
  SelectContent,
  SelectViewport,
  SelectItem,
  SelectItemText,
  SelectItemIndicator,
} from 'reka-ui'

export interface NSelectItem {
  label: string
  value: string
  disabled?: boolean
}

export interface NSelectProps {
  modelValue?: string
  items?: NSelectItem[]
  placeholder?: string
  disabled?: boolean
}

withDefaults(defineProps<NSelectProps>(), {
  modelValue: '',
  items: () => [],
  placeholder: 'Select...',
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <SelectRoot
    :model-value="modelValue"
    :disabled="disabled"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <SelectTrigger
      :class="[
        'n-select__trigger',
        { 'n-select__trigger--disabled': disabled },
      ]"
    >
      <SelectValue
        :placeholder="placeholder"
        class="n-select__value"
      />
      <svg
        class="n-select__chevron"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4 6L8 10L12 6"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </SelectTrigger>
    <SelectPortal>
      <SelectContent class="n-select__content" position="popper" :side-offset="4">
        <SelectViewport class="n-select__viewport">
          <SelectItem
            v-for="item in items"
            :key="item.value"
            :value="item.value"
            :disabled="item.disabled"
            class="n-select__item"
          >
            <SelectItemText>{{ item.label }}</SelectItemText>
            <SelectItemIndicator class="n-select__item-indicator">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 7L6 10L11 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </SelectItemIndicator>
          </SelectItem>
        </SelectViewport>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>

<style scoped>
.n-select__trigger {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-2);
  min-width: 180px;
  height: 40px;
  padding: 0 var(--spacing-3);
  border: var(--borderWidth-1) solid var(--color-neutral-300);
  border-radius: var(--radius-md);
  background-color: var(--color-neutral-0);
  font-family: var(--font-fontFamily-sans);
  font-size: var(--font-fontSize-sm);
  color: var(--color-neutral-800);
  cursor: pointer;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  outline: none;
}

.n-select__trigger:hover:not(.n-select__trigger--disabled) {
  border-color: var(--color-neutral-400);
}

.n-select__trigger:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 2px var(--color-primary-50);
}

.n-select__trigger--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: var(--color-neutral-50);
}

.n-select__value {
  flex: 1;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.n-select__chevron {
  flex-shrink: 0;
  color: var(--color-neutral-400);
}

.n-select__content {
  z-index: 1000;
  min-width: var(--reka-select-trigger-width);
  max-height: 300px;
  overflow: hidden;
  background-color: var(--color-neutral-0);
  border: var(--borderWidth-1) solid var(--color-neutral-200);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
}

.n-select__content[data-state='open'] {
  animation: n-select-fadeIn var(--transition-fast) ease-out;
}

.n-select__content[data-state='closed'] {
  animation: n-select-fadeOut var(--transition-fast) ease-in;
}

.n-select__viewport {
  padding: var(--spacing-1);
}

.n-select__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-3);
  border-radius: var(--radius-sm);
  font-family: var(--font-fontFamily-sans);
  font-size: var(--font-fontSize-sm);
  color: var(--color-neutral-800);
  cursor: pointer;
  user-select: none;
  outline: none;
  transition: background-color var(--transition-fast);
}

.n-select__item:hover,
.n-select__item[data-highlighted] {
  background-color: var(--color-primary-50);
  color: var(--color-primary-700);
}

.n-select__item[data-state='checked'] {
  font-weight: var(--font-fontWeight-medium);
}

.n-select__item[data-disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}

.n-select__item-indicator {
  display: inline-flex;
  align-items: center;
  color: var(--color-primary-500);
}

@keyframes n-select-fadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes n-select-fadeOut {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-4px);
  }
}
</style>
