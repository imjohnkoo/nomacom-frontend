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
      v-bind="$attrs"
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
/** 래퍼 `<div>` 루트 — `min`/`max`/`step`/`name` 이 무시되지 않도록 `<input>` 으로 전달. */
defineOptions({ inheritAttrs: false })

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
  font-family: var(--n-font-family-sans, 'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Segoe UI', 'Noto Sans KR', sans-serif);
}

.n-input-time__input {
  width: 100%;
  padding: var(--n-spacing-2, 0.5rem) var(--n-spacing-3, 0.75rem);
  padding-right: var(--n-spacing-10, 2.5rem);
  border: var(--n-border-width-1, 1px) solid var(--n-color-neutral-300, #d4d4d4);
  border-radius: var(--n-radius-md, 0.375rem);
  background-color: var(--n-color-neutral-0, #ffffff);
  font-size: var(--n-font-size-base, 1rem);
  font-family: var(--n-font-family-sans, 'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Segoe UI', 'Noto Sans KR', sans-serif);
  color: var(--n-color-neutral-800, #262626);
  outline: none;
  transition: border-color var(--n-transition-fast, 150ms ease),
    box-shadow var(--n-transition-fast, 150ms ease);
}

.n-input-time__input:focus {
  border-color: var(--n-color-primary-500, #6239FF);
  box-shadow: 0 0 0 2px var(--n-color-primary-100, #e3dbff);
}

.n-input-time__input::placeholder {
  color: var(--n-color-neutral-400, #a3a3a3);
}

.n-input-time__icon {
  position: absolute;
  right: var(--n-spacing-3, 0.75rem);
  display: flex;
  align-items: center;
  color: var(--n-color-neutral-400, #a3a3a3);
  pointer-events: none;
}

.n-input-time--disabled .n-input-time__input {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: var(--n-color-neutral-50, #fafafa);
}

.n-input-time--disabled .n-input-time__icon {
  opacity: 0.5;
}
</style>
