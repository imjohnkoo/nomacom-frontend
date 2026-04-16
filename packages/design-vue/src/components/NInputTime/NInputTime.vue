<template>
  <div
    :class="[
      'n-input-time',
      { 'n-input-time--disabled': disabled },
    ]"
  >
    <input
      type="time"
      class="n-input-time__input"
      :value="modelValue"
      :disabled="disabled"
      :placeholder="placeholder"
      @input="handleInput"
    />
    <span class="n-input-time__icon">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.5" />
        <path
          d="M8 4.5V8L10.5 9.5"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </span>
  </div>
</template>

<script setup lang="ts">
export interface NInputTimeProps {
  modelValue?: string
  disabled?: boolean
  placeholder?: string
}

withDefaults(defineProps<NInputTimeProps>(), {
  modelValue: undefined,
  disabled: false,
  placeholder: 'HH:mm',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<style scoped>
.n-input-time {
  position: relative;
  display: inline-flex;
  align-items: center;
  width: 100%;
  font-family: var(--font-fontFamily-sans, sans-serif);
}

.n-input-time__input {
  width: 100%;
  padding: var(--spacing-2, 0.5rem) var(--spacing-3, 0.75rem);
  padding-right: var(--spacing-10, 2.5rem);
  border: var(--borderWidth-1, 1px) solid var(--color-neutral-300, #d4d4d4);
  border-radius: var(--radius-md, 0.375rem);
  background-color: var(--color-neutral-0, #ffffff);
  font-size: var(--font-fontSize-base, 1rem);
  font-family: var(--font-fontFamily-sans, sans-serif);
  color: var(--color-neutral-800, #262626);
  outline: none;
  transition: border-color var(--transition-fast, 150ms ease),
    box-shadow var(--transition-fast, 150ms ease);
}

.n-input-time__input:focus {
  border-color: var(--color-primary-500, #3b82f6);
  box-shadow: 0 0 0 2px var(--color-primary-100, #dbeafe);
}

.n-input-time__input::placeholder {
  color: var(--color-neutral-400, #a3a3a3);
}

.n-input-time__icon {
  position: absolute;
  right: var(--spacing-3, 0.75rem);
  display: flex;
  align-items: center;
  color: var(--color-neutral-400, #a3a3a3);
  pointer-events: none;
}

.n-input-time--disabled .n-input-time__input {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: var(--color-neutral-50, #fafafa);
}

.n-input-time--disabled .n-input-time__icon {
  opacity: 0.5;
}
</style>
