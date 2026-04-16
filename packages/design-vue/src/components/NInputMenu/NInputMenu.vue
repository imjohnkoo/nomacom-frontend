<template>
  <ComboboxRoot
    v-model="selectedValue"
    v-model:search-term="searchTerm"
    :disabled="disabled"
    class="n-input-menu"
  >
    <div class="n-input-menu__control">
      <ComboboxInput
        v-if="searchable"
        class="n-input-menu__input"
        :placeholder="placeholder"
        :disabled="disabled"
      />
      <ComboboxTrigger class="n-input-menu__trigger" :disabled="disabled">
        <svg
          class="n-input-menu__icon"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </ComboboxTrigger>
    </div>

    <ComboboxPortal>
      <ComboboxContent class="n-input-menu__content" position="popper" :side-offset="4">
        <ComboboxEmpty class="n-input-menu__empty">
          No results found
        </ComboboxEmpty>
        <ComboboxItem
          v-for="item in items"
          :key="item.value"
          :value="item.value"
          class="n-input-menu__item"
        >
          <ComboboxItemIndicator class="n-input-menu__item-indicator">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M11.5 3.5L5.5 10L2.5 7"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </ComboboxItemIndicator>
          <span class="n-input-menu__item-label">{{ item.label }}</span>
        </ComboboxItem>
      </ComboboxContent>
    </ComboboxPortal>
  </ComboboxRoot>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  ComboboxRoot,
  ComboboxInput,
  ComboboxTrigger,
  ComboboxPortal,
  ComboboxContent,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxEmpty,
} from 'reka-ui'

export interface NInputMenuItem {
  label: string
  value: string
}

export interface NInputMenuProps {
  modelValue?: string
  items?: NInputMenuItem[]
  placeholder?: string
  disabled?: boolean
  searchable?: boolean
}

const props = withDefaults(defineProps<NInputMenuProps>(), {
  modelValue: undefined,
  items: () => [],
  placeholder: 'Search...',
  disabled: false,
  searchable: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const searchTerm = ref('')

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
.n-input-menu {
  position: relative;
  width: 100%;
  font-family: var(--font-fontFamily-sans, sans-serif);
}

.n-input-menu__control {
  display: flex;
  align-items: center;
  border: var(--borderWidth-1, 1px) solid var(--color-neutral-300, #d4d4d4);
  border-radius: var(--radius-md, 0.375rem);
  background-color: var(--color-neutral-0, #ffffff);
  transition: border-color var(--transition-fast, 150ms ease);
}

.n-input-menu__control:focus-within {
  border-color: var(--color-primary-500, #3b82f6);
  box-shadow: 0 0 0 2px var(--color-primary-100, #dbeafe);
}

.n-input-menu__input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  padding: var(--spacing-2, 0.5rem) var(--spacing-3, 0.75rem);
  font-size: var(--font-fontSize-base, 1rem);
  font-family: var(--font-fontFamily-sans, sans-serif);
  color: var(--color-neutral-800, #262626);
}

.n-input-menu__input::placeholder {
  color: var(--color-neutral-400, #a3a3a3);
}

.n-input-menu__input:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.n-input-menu__trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2, 0.5rem);
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--color-neutral-500, #737373);
  transition: color var(--transition-fast, 150ms ease);
}

.n-input-menu__trigger:hover {
  color: var(--color-neutral-700, #404040);
}

.n-input-menu__trigger:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.n-input-menu__icon {
  flex-shrink: 0;
}

.n-input-menu__content {
  width: var(--reka-combobox-trigger-width);
  max-height: 240px;
  overflow-y: auto;
  background-color: var(--color-neutral-0, #ffffff);
  border: var(--borderWidth-1, 1px) solid var(--color-neutral-200, #e5e5e5);
  border-radius: var(--radius-md, 0.375rem);
  box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
  padding: var(--spacing-1, 0.25rem);
  z-index: 50;
}

.n-input-menu__empty {
  padding: var(--spacing-3, 0.75rem);
  text-align: center;
  font-size: var(--font-fontSize-sm, 0.875rem);
  color: var(--color-neutral-500, #737373);
}

.n-input-menu__item {
  display: flex;
  align-items: center;
  gap: var(--spacing-2, 0.5rem);
  padding: var(--spacing-2, 0.5rem) var(--spacing-3, 0.75rem);
  border-radius: var(--radius-sm, 0.25rem);
  font-size: var(--font-fontSize-base, 1rem);
  color: var(--color-neutral-800, #262626);
  cursor: pointer;
  transition: background-color var(--transition-fast, 150ms ease);
  outline: none;
}

.n-input-menu__item[data-highlighted] {
  background-color: var(--color-primary-50, #eff6ff);
  color: var(--color-primary-700, #1d4ed8);
}

.n-input-menu__item[data-state='checked'] {
  font-weight: var(--font-fontWeight-medium, 500);
}

.n-input-menu__item[data-disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}

.n-input-menu__item-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  color: var(--color-primary-600, #2563eb);
}

.n-input-menu__item-label {
  flex: 1;
}
</style>
