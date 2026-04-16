<script setup lang="ts">
import { SliderRoot, SliderTrack, SliderRange, SliderThumb } from 'reka-ui'

export interface NSliderProps {
  modelValue?: number[]
  min?: number
  max?: number
  step?: number
  disabled?: boolean
}

withDefaults(defineProps<NSliderProps>(), {
  modelValue: () => [0],
  min: 0,
  max: 100,
  step: 1,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: number[]]
}>()
</script>

<template>
  <SliderRoot
    :model-value="modelValue"
    :min="min"
    :max="max"
    :step="step"
    :disabled="disabled"
    :class="[
      'n-slider',
      { 'n-slider--disabled': disabled },
    ]"
    @update:model-value="emit('update:modelValue', $event as number[])"
  >
    <SliderTrack class="n-slider__track">
      <SliderRange class="n-slider__range" />
    </SliderTrack>
    <SliderThumb
      v-for="(_, index) in modelValue"
      :key="index"
      class="n-slider__thumb"
    />
  </SliderRoot>
</template>

<style scoped>
.n-slider {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 20px;
  user-select: none;
  touch-action: none;
}

.n-slider--disabled {
  opacity: 0.5;
  pointer-events: none;
}

.n-slider__track {
  position: relative;
  flex-grow: 1;
  height: 6px;
  border-radius: var(--radius-full);
  background-color: var(--color-neutral-100);
}

.n-slider__range {
  position: absolute;
  height: 100%;
  border-radius: var(--radius-full);
  background-color: var(--color-primary-500);
}

.n-slider__thumb {
  display: block;
  width: 18px;
  height: 18px;
  border-radius: var(--radius-full);
  background-color: var(--color-neutral-0);
  border: var(--borderWidth-2) solid var(--color-primary-500);
  box-shadow: var(--shadow-sm);
  cursor: grab;
  transition: box-shadow var(--transition-fast), transform var(--transition-fast);
}

.n-slider__thumb:hover {
  box-shadow: var(--shadow-md);
}

.n-slider__thumb:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

.n-slider__thumb:active {
  cursor: grabbing;
  transform: scale(1.1);
}
</style>
