<template>
  <div
    class="n-step-progress"
    role="progressbar"
    :aria-valuenow="step"
    :aria-valuemin="1"
    :aria-valuemax="total"
  >
    <div class="n-step-progress__bar">
      <span
        v-for="i in total"
        :key="i"
        :class="['n-step-progress__seg', { 'n-step-progress__seg--active': i <= step }]"
      />
    </div>
    <p v-if="showLabel" class="n-step-progress__label">
      <span class="tabular">{{ step }} / {{ total }}</span>
      <span v-if="label">&nbsp;{{ label }}</span>
    </p>
  </div>
</template>

<script setup lang="ts">
export interface NStepProgressProps {
  step: number
  total?: number
  label?: string
  showLabel?: boolean
}

withDefaults(defineProps<NStepProgressProps>(), {
  total: 4,
  label: undefined,
  showLabel: true,
})
</script>

<style scoped>
.n-step-progress {
  font-family: var(--font-fontFamily-sans, sans-serif);
}

.n-step-progress__bar {
  display: flex;
  align-items: center;
  gap: 6px;
}

.n-step-progress__seg {
  flex: 1;
  height: 6px;
  border-radius: var(--radius-full, 9999px);
  background-color: var(--color-neutral-200, #e5e5e5);
  transition: background-color 220ms ease;
}

.n-step-progress__seg--active {
  background-color: var(--color-primary-500, #6239ff);
}

.n-step-progress__label {
  margin: 8px 0 0;
  font-size: 11px;
  font-weight: 500;
  color: var(--color-neutral-400, #a3a3a3);
}

.n-step-progress__label .tabular {
  font-variant-numeric: tabular-nums;
}
</style>
