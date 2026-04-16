<template>
  <ListboxRoot
    v-model="selectedValue"
    :multiple="multiple"
    class="n-select-menu"
  >
    <ListboxContent class="n-select-menu__content">
      <ListboxItem
        v-for="item in items"
        :key="item.value"
        :value="item.value"
        :disabled="item.disabled"
        class="n-select-menu__item"
      >
        <ListboxItemIndicator class="n-select-menu__item-indicator">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M11.5 3.5L5.5 10L2.5 7"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </ListboxItemIndicator>
        <span class="n-select-menu__item-label">{{ item.label }}</span>
      </ListboxItem>
    </ListboxContent>
  </ListboxRoot>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  ListboxRoot,
  ListboxContent,
  ListboxItem,
  ListboxItemIndicator,
} from 'reka-ui'

export interface NSelectMenuItem {
  label: string
  value: string
  disabled?: boolean
}

export interface NSelectMenuProps {
  modelValue?: string | string[]
  items?: NSelectMenuItem[]
  multiple?: boolean
}

const props = withDefaults(defineProps<NSelectMenuProps>(), {
  modelValue: undefined,
  items: () => [],
  multiple: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | string[]]
}>()

const selectedValue = computed({
  get: () => props.modelValue,
  set: (val) => {
    if (val !== undefined) {
      emit('update:modelValue', val)
    }
  },
})
</script>

<style scoped>
.n-select-menu {
  font-family: var(--font-fontFamily-sans, sans-serif);
  width: 100%;
}

.n-select-menu__content {
  border: var(--borderWidth-1, 1px) solid var(--color-neutral-200, #e5e5e5);
  border-radius: var(--radius-md, 0.375rem);
  background-color: var(--color-neutral-0, #ffffff);
  overflow: hidden;
}

.n-select-menu__item {
  display: flex;
  align-items: center;
  gap: var(--spacing-2, 0.5rem);
  padding: var(--spacing-2, 0.5rem) var(--spacing-3, 0.75rem);
  font-size: var(--font-fontSize-base, 1rem);
  color: var(--color-neutral-800, #262626);
  cursor: pointer;
  outline: none;
  transition: background-color var(--transition-fast, 150ms ease);
  border-bottom: var(--borderWidth-1, 1px) solid var(--color-neutral-100, #f5f5f5);
}

.n-select-menu__item:last-child {
  border-bottom: none;
}

.n-select-menu__item[data-highlighted] {
  background-color: var(--color-primary-50, #eff6ff);
}

.n-select-menu__item[data-state='checked'] {
  background-color: var(--color-primary-50, #eff6ff);
  font-weight: var(--font-fontWeight-medium, 500);
  color: var(--color-primary-700, #1d4ed8);
}

.n-select-menu__item[data-disabled] {
  opacity: 0.5;
  cursor: not-allowed;
  color: var(--color-neutral-400, #a3a3a3);
}

.n-select-menu__item-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  flex-shrink: 0;
  color: var(--color-primary-600, #2563eb);
}

.n-select-menu__item-label {
  flex: 1;
}
</style>
