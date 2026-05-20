<template>
  <span :class="['n-status-pill', `n-status-pill--${color}`]">
    <span v-if="$slots.icon" class="n-status-pill__icon" aria-hidden="true">
      <slot name="icon" />
    </span>
    <span v-else-if="dot" class="n-status-pill__dot" aria-hidden="true" />
    <slot>{{ label }}</slot>
  </span>
</template>

<script setup lang="ts">
export type NStatusPillColor = 'success' | 'info' | 'warning' | 'error' | 'primary' | 'neutral'

export interface NStatusPillProps {
  label?: string
  color?: NStatusPillColor
  dot?: boolean
}

withDefaults(defineProps<NStatusPillProps>(), {
  label: undefined,
  color: 'success',
  dot: false,
})
</script>

<style scoped>
.n-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: var(--radius-full, 9999px);
  font-family: var(--font-fontFamily-sans, sans-serif);
  font-size: 11px;
  font-weight: 600;
  line-height: 1.4;
}

.n-status-pill__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.n-status-pill__dot {
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full, 9999px);
  background-color: currentColor;
}

.n-status-pill--success {
  background-color: var(--color-success-50, #ecfdf5);
  color: var(--color-success-700, #059669);
}

.n-status-pill--info {
  background-color: #eef2ff;
  color: #4f46e5;
}

.n-status-pill--warning {
  background-color: var(--color-warning-50, #fff7ed);
  color: var(--color-warning-700, #b45309);
}

.n-status-pill--error {
  background-color: var(--color-error-50, #fef2f2);
  color: var(--color-error-700, #b91c1c);
}

.n-status-pill--primary {
  background-color: var(--color-primary-50, #f1edff);
  color: var(--color-primary-700, #3f1cc0);
}

.n-status-pill--neutral {
  background-color: var(--color-neutral-100, #f5f5f5);
  color: var(--color-neutral-700, #404040);
}
</style>
