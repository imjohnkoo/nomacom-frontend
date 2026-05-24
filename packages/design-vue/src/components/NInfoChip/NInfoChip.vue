<template>
  <span class="n-info-chip">
    <span v-if="$slots.icon" class="n-info-chip__icon" aria-hidden="true">
      <slot name="icon" />
    </span>
    <span v-if="label" class="n-info-chip__label">{{ label }}</span>
    <span v-if="value" class="n-info-chip__value">{{ value }}</span>
    <slot />
  </span>
</template>

<script setup lang="ts">
export interface NInfoChipProps {
  label?: string
  value?: string | number
}

withDefaults(defineProps<NInfoChipProps>(), {
  label: undefined,
  value: undefined,
})
</script>

<style scoped>
.n-info-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: var(--radius-full, 9999px);
  background-color: var(--color-primary-50, #f1edff);
  color: var(--color-primary-700, #3f1cc0);
  font-family: var(--font-fontFamily-sans, sans-serif);
  font-size: 12px;
  line-height: 1.4;
}

.n-info-chip__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary-500, #6239ff);
}

.n-info-chip__label {
  font-weight: 500;
}

.n-info-chip__value {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
</style>
