<template>
  <div class="n-color-picker">
    <div class="n-color-picker__input-wrapper">
      <label class="n-color-picker__preview-wrapper">
        <div
          class="n-color-picker__preview"
          :style="{ backgroundColor: modelValue || '#000000' }"
        />
        <input
          type="color"
          class="n-color-picker__native"
          :value="modelValue || '#000000'"
          @input="handleNativeInput"
        />
      </label>
      <input
        type="text"
        class="n-color-picker__hex"
        :value="modelValue || '#000000'"
        maxlength="7"
        @input="handleTextInput"
        @blur="handleTextBlur"
      />
    </div>

    <div v-if="swatches && swatches.length > 0" class="n-color-picker__swatches">
      <button
        v-for="color in swatches"
        :key="color"
        type="button"
        class="n-color-picker__swatch"
        :class="{ 'n-color-picker__swatch--active': modelValue === color }"
        :style="{ backgroundColor: color }"
        :aria-label="`Select color ${color}`"
        @click="selectColor(color)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
export interface NColorPickerProps {
  modelValue?: string
  swatches?: string[]
}

withDefaults(defineProps<NColorPickerProps>(), {
  modelValue: undefined,
  swatches: () => [],
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function handleNativeInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

function handleTextInput(event: Event) {
  const target = event.target as HTMLInputElement
  const val = target.value
  if (/^#[0-9a-fA-F]{6}$/.test(val)) {
    emit('update:modelValue', val)
  }
}

function handleTextBlur(event: FocusEvent) {
  const target = event.target as HTMLInputElement
  const val = target.value
  if (/^#[0-9a-fA-F]{6}$/.test(val)) {
    emit('update:modelValue', val)
  }
}

function selectColor(color: string) {
  emit('update:modelValue', color)
}
</script>

<style scoped>
.n-color-picker {
  font-family: var(--n-font-family-sans, 'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Segoe UI', 'Noto Sans KR', sans-serif);
  display: flex;
  flex-direction: column;
  gap: var(--n-spacing-3, 0.75rem);
}

.n-color-picker__input-wrapper {
  display: flex;
  align-items: center;
  gap: var(--n-spacing-2, 0.5rem);
  border: var(--n-border-width-1, 1px) solid var(--n-color-neutral-300, #d4d4d4);
  border-radius: var(--n-radius-md, 0.375rem);
  padding: var(--n-spacing-1, 0.25rem) var(--n-spacing-2, 0.5rem);
  background-color: var(--n-color-neutral-0, #ffffff);
  transition: border-color var(--n-transition-fast, 150ms ease);
}

.n-color-picker__input-wrapper:focus-within {
  border-color: var(--n-color-primary-500, #6239FF);
  box-shadow: 0 0 0 2px var(--n-color-primary-100, #e3dbff);
}

.n-color-picker__preview-wrapper {
  position: relative;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  cursor: pointer;
}

.n-color-picker__preview {
  width: 100%;
  height: 100%;
  border-radius: var(--n-radius-sm, 0.25rem);
  border: var(--n-border-width-1, 1px) solid var(--n-color-neutral-200, #e5e5e5);
}

.n-color-picker__native {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  border: none;
  padding: 0;
}

.n-color-picker__hex {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  font-size: var(--n-font-size-sm, 0.875rem);
  font-family: var(--n-font-family-sans, 'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Segoe UI', 'Noto Sans KR', sans-serif);
  color: var(--n-color-neutral-800, #262626);
  padding: var(--n-spacing-1, 0.25rem);
  text-transform: uppercase;
}

.n-color-picker__swatches {
  display: flex;
  flex-wrap: wrap;
  gap: var(--n-spacing-2, 0.5rem);
}

.n-color-picker__swatch {
  width: 28px;
  height: 28px;
  border: var(--n-border-width-2, 2px) solid transparent;
  border-radius: var(--n-radius-md, 0.375rem);
  cursor: pointer;
  transition: all var(--n-transition-fast, 150ms ease);
  padding: 0;
  outline: none;
}

.n-color-picker__swatch:hover {
  transform: scale(1.1);
}

.n-color-picker__swatch:focus-visible {
  box-shadow: 0 0 0 2px var(--n-color-primary-500, #6239FF);
}

.n-color-picker__swatch--active {
  border-color: var(--n-color-neutral-800, #262626);
  box-shadow: 0 0 0 2px var(--n-color-neutral-0, #ffffff), 0 0 0 4px var(--n-color-neutral-800, #262626);
}
</style>
