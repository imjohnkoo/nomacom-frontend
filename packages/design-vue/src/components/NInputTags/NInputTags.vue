<script setup lang="ts">
import {
  TagsInputRoot,
  TagsInputInput,
  TagsInputItem,
  TagsInputItemText,
  TagsInputItemDelete,
  TagsInputClear,
} from 'reka-ui'

export interface NInputTagsProps {
  modelValue?: string[]
  placeholder?: string
  disabled?: boolean
  max?: number
}

withDefaults(defineProps<NInputTagsProps>(), {
  modelValue: () => [],
  placeholder: 'Add tag...',
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()
</script>

<template>
  <TagsInputRoot
    :model-value="modelValue"
    :disabled="disabled"
    :max="max"
    :class="[
      'n-input-tags',
      { 'n-input-tags--disabled': disabled },
    ]"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <TagsInputItem
      v-for="tag in modelValue"
      :key="tag"
      :value="tag"
      class="n-input-tags__tag"
    >
      <TagsInputItemText class="n-input-tags__tag-text" />
      <TagsInputItemDelete class="n-input-tags__tag-delete">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 3L9 9M9 3L3 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      </TagsInputItemDelete>
    </TagsInputItem>
    <TagsInputInput
      :placeholder="modelValue.length === 0 ? placeholder : ''"
      class="n-input-tags__input"
    />
    <TagsInputClear
      v-if="modelValue.length > 0"
      class="n-input-tags__clear"
    >
      Clear
    </TagsInputClear>
  </TagsInputRoot>
</template>

<style scoped>
.n-input-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-2) var(--spacing-3);
  border: var(--borderWidth-1) solid var(--color-neutral-300);
  border-radius: var(--radius-md);
  background-color: var(--color-neutral-0);
  min-height: 40px;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.n-input-tags:focus-within {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 2px var(--color-primary-50);
}

.n-input-tags--disabled {
  opacity: 0.5;
  pointer-events: none;
  background-color: var(--color-neutral-50);
}

.n-input-tags__tag {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-0) var(--spacing-2);
  height: 26px;
  border-radius: var(--radius-sm);
  background-color: var(--color-primary-50);
  color: var(--color-primary-700);
  font-family: var(--font-fontFamily-sans);
  font-size: var(--font-fontSize-xs);
  font-weight: var(--font-fontWeight-medium);
  line-height: 1;
}

.n-input-tags__tag[data-state='active'] {
  outline: 2px solid var(--color-primary-500);
  outline-offset: -1px;
}

.n-input-tags__tag-text {
  line-height: 1;
}

.n-input-tags__tag-delete {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
  color: var(--color-primary-500);
  border-radius: var(--radius-sm);
  transition: background-color var(--transition-fast), color var(--transition-fast);
}

.n-input-tags__tag-delete:hover {
  background-color: var(--color-primary-100);
  color: var(--color-primary-700);
}

.n-input-tags__input {
  flex: 1;
  min-width: 80px;
  border: none;
  outline: none;
  background: transparent;
  font-family: var(--font-fontFamily-sans);
  font-size: var(--font-fontSize-sm);
  color: var(--color-neutral-800);
  padding: var(--spacing-1) 0;
}

.n-input-tags__input::placeholder {
  color: var(--color-neutral-400);
}

.n-input-tags__clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-0) var(--spacing-2);
  height: 24px;
  border: none;
  background: none;
  cursor: pointer;
  font-family: var(--font-fontFamily-sans);
  font-size: var(--font-fontSize-xs);
  color: var(--color-neutral-400);
  transition: color var(--transition-fast);
}

.n-input-tags__clear:hover {
  color: var(--color-neutral-600);
}
</style>
