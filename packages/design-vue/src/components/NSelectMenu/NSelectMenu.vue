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
  font-family: var(--n-font-family-sans, 'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Segoe UI', 'Noto Sans KR', sans-serif);
  width: 100%;
}

.n-select-menu__content {
  border: var(--n-border-width-1, 1px) solid var(--n-color-neutral-200, #e5e5e5);
  border-radius: var(--n-radius-md, 0.375rem);
  background-color: var(--n-color-neutral-0, #ffffff);
  overflow: hidden;
}

.n-select-menu__item {
  display: flex;
  align-items: center;
  gap: var(--n-spacing-2, 0.5rem);
  padding: var(--n-spacing-2, 0.5rem) var(--n-spacing-3, 0.75rem);
  font-size: var(--n-font-size-base, 1rem);
  color: var(--n-color-neutral-800, #262626);
  cursor: pointer;
  outline: none;
  transition: background-color var(--n-transition-fast, 150ms ease);
  border-bottom: var(--n-border-width-1, 1px) solid var(--n-color-neutral-100, #f5f5f5);
}

.n-select-menu__item:last-child {
  border-bottom: none;
}

.n-select-menu__item[data-highlighted] {
  background-color: var(--n-color-primary-50, #f1edff);
}

.n-select-menu__item[data-state='checked'] {
  background-color: var(--n-color-primary-50, #f1edff);
  font-weight: var(--n-font-weight-medium, 500);
  color: var(--n-color-primary-700, #3f1cc0);
}

.n-select-menu__item[data-disabled] {
  opacity: 0.5;
  cursor: not-allowed;
  color: var(--n-color-neutral-400, #a3a3a3);
}

.n-select-menu__item-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  flex-shrink: 0;
  color: var(--n-color-primary-600, #5025e8);
}

.n-select-menu__item-label {
  flex: 1;
}
</style>
