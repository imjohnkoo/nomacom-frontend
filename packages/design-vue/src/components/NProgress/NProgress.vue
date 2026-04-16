<script setup lang="ts">
import { computed } from 'vue'
import { ProgressRoot, ProgressIndicator } from 'reka-ui'

export type NColor = 'primary' | 'success' | 'warning' | 'error' | 'info'

export interface NProgressProps {
  modelValue?: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  color?: NColor
}

const props = withDefaults(defineProps<NProgressProps>(), {
  modelValue: 0,
  max: 100,
  size: 'md',
  color: 'primary',
})

const percentage = computed(() => {
  const clamped = Math.min(Math.max(props.modelValue, 0), props.max)
  return (clamped / props.max) * 100
})
</script>

<template>
  <ProgressRoot
    :model-value="modelValue"
    :max="max"
    :class="[
      'n-progress',
      `n-progress--${size}`,
      `n-progress--${color}`,
    ]"
  >
    <ProgressIndicator
      class="n-progress__indicator"
      :style="{ width: `${percentage}%` }"
    />
  </ProgressRoot>
</template>

<style scoped>
.n-progress {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: var(--radius-full);
  background-color: var(--color-neutral-100);
}

.n-progress--sm {
  height: 4px;
}

.n-progress--md {
  height: 8px;
}

.n-progress--lg {
  height: 12px;
}

.n-progress__indicator {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width var(--transition-normal) ease;
}

.n-progress--primary .n-progress__indicator {
  background-color: var(--color-primary-500);
}

.n-progress--success .n-progress__indicator {
  background-color: var(--color-success-500);
}

.n-progress--warning .n-progress__indicator {
  background-color: var(--color-warning-500);
}

.n-progress--error .n-progress__indicator {
  background-color: var(--color-error-500);
}

.n-progress--info .n-progress__indicator {
  background-color: var(--color-info-500);
}
</style>
