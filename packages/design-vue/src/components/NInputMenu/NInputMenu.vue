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
  font-family: var(--n-font-family-sans, 'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Segoe UI', 'Noto Sans KR', sans-serif);
}

.n-input-menu__control {
  display: flex;
  align-items: center;
  border: var(--n-border-width-1, 1px) solid var(--n-color-neutral-300, #d4d4d4);
  border-radius: var(--n-radius-md, 0.375rem);
  background-color: var(--n-color-neutral-0, #ffffff);
  transition: border-color var(--n-transition-fast, 150ms ease);
}

.n-input-menu__control:focus-within {
  border-color: var(--n-color-primary-500, #6239FF);
  box-shadow: 0 0 0 2px var(--n-color-primary-100, #e3dbff);
}

.n-input-menu__input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  padding: var(--n-spacing-2, 0.5rem) var(--n-spacing-3, 0.75rem);
  font-size: var(--n-font-size-base, 1rem);
  font-family: var(--n-font-family-sans, 'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Segoe UI', 'Noto Sans KR', sans-serif);
  color: var(--n-color-neutral-800, #262626);
}

.n-input-menu__input::placeholder {
  color: var(--n-color-neutral-400, #a3a3a3);
}

.n-input-menu__input:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.n-input-menu__trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--n-spacing-2, 0.5rem);
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--n-color-neutral-500, #737373);
  transition: color var(--n-transition-fast, 150ms ease);
}

.n-input-menu__trigger:hover {
  color: var(--n-color-neutral-700, #404040);
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
  background-color: var(--n-color-neutral-0, #ffffff);
  border: var(--n-border-width-1, 1px) solid var(--n-color-neutral-200, #e5e5e5);
  border-radius: var(--n-radius-md, 0.375rem);
  box-shadow: var(--n-shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
  padding: var(--n-spacing-1, 0.25rem);
  z-index: 50;
}

.n-input-menu__empty {
  padding: var(--n-spacing-3, 0.75rem);
  text-align: center;
  font-size: var(--n-font-size-sm, 0.875rem);
  color: var(--n-color-neutral-500, #737373);
}

.n-input-menu__item {
  display: flex;
  align-items: center;
  gap: var(--n-spacing-2, 0.5rem);
  padding: var(--n-spacing-2, 0.5rem) var(--n-spacing-3, 0.75rem);
  border-radius: var(--n-radius-sm, 0.25rem);
  font-size: var(--n-font-size-base, 1rem);
  color: var(--n-color-neutral-800, #262626);
  cursor: pointer;
  transition: background-color var(--n-transition-fast, 150ms ease);
  outline: none;
}

.n-input-menu__item[data-highlighted] {
  background-color: var(--n-color-primary-50, #f1edff);
  color: var(--n-color-primary-700, #3f1cc0);
}

.n-input-menu__item[data-state='checked'] {
  font-weight: var(--n-font-weight-medium, 500);
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
  color: var(--n-color-primary-600, #5025e8);
}

.n-input-menu__item-label {
  flex: 1;
}
</style>
