<script setup lang="ts">
import { SwitchRoot, SwitchThumb } from 'reka-ui'

export interface NSwitchProps {
  modelValue?: boolean
  label?: string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}

withDefaults(defineProps<NSwitchProps>(), {
  modelValue: false,
  disabled: false,
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<template>
  <label
    :class="[
      'n-switch',
      `n-switch--${size}`,
      { 'n-switch--disabled': disabled },
    ]"
  >
    <SwitchRoot
      :checked="modelValue"
      :disabled="disabled"
      :class="[
        'n-switch__track',
        `n-switch__track--${size}`,
      ]"
      @update:checked="emit('update:modelValue', $event)"
    >
      <SwitchThumb
        :class="[
          'n-switch__thumb',
          `n-switch__thumb--${size}`,
        ]"
      />
    </SwitchRoot>
    <span v-if="label" class="n-switch__label">{{ label }}</span>
  </label>
</template>

<style scoped>
.n-switch {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  cursor: pointer;
  user-select: none;
}

.n-switch--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.n-switch__track {
  position: relative;
  display: inline-flex;
  align-items: center;
  border-radius: var(--radius-full);
  background-color: var(--color-neutral-200);
  transition: background-color var(--transition-fast);
  cursor: inherit;
  flex-shrink: 0;
  border: none;
  padding: 0;
}

.n-switch__track--sm {
  width: 28px;
  height: 16px;
}

.n-switch__track--md {
  width: 36px;
  height: 20px;
}

.n-switch__track--lg {
  width: 44px;
  height: 24px;
}

.n-switch__track:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

.n-switch__track[data-state='checked'] {
  background-color: var(--color-primary-500);
}

.n-switch__thumb {
  display: block;
  border-radius: var(--radius-full);
  background-color: var(--color-neutral-0);
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition-fast);
  will-change: transform;
}

.n-switch__thumb--sm {
  width: 12px;
  height: 12px;
  transform: translateX(2px);
}

.n-switch__thumb--md {
  width: 16px;
  height: 16px;
  transform: translateX(2px);
}

.n-switch__thumb--lg {
  width: 20px;
  height: 20px;
  transform: translateX(2px);
}

.n-switch__thumb--sm[data-state='checked'] {
  transform: translateX(14px);
}

.n-switch__thumb--md[data-state='checked'] {
  transform: translateX(18px);
}

.n-switch__thumb--lg[data-state='checked'] {
  transform: translateX(22px);
}

.n-switch__label {
  font-family: var(--font-fontFamily-sans);
  font-size: var(--font-fontSize-sm);
  font-weight: var(--font-fontWeight-regular);
  color: var(--color-neutral-800);
  line-height: 1.4;
}
</style>
