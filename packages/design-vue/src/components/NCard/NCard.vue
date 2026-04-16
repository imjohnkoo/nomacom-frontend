<template>
  <div
    :class="[
      'n-card',
      `n-card--${variant}`,
      { 'n-card--padded': padding },
    ]"
  >
    <div v-if="$slots.header" class="n-card__header">
      <slot name="header" />
    </div>
    <div class="n-card__body">
      <slot />
    </div>
    <div v-if="$slots.footer" class="n-card__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
export interface NCardProps {
  variant?: 'outline' | 'soft' | 'elevated'
  padding?: boolean
}

withDefaults(defineProps<NCardProps>(), {
  variant: 'outline',
  padding: true,
})
</script>

<style scoped>
.n-card {
  border-radius: var(--radius-lg, 0.5rem);
  background-color: var(--color-neutral-0, #ffffff);
  overflow: hidden;
}

.n-card--outline {
  border: var(--borderWidth-1, 1px) solid var(--color-neutral-200, #e5e5e5);
}

.n-card--soft {
  background-color: var(--color-neutral-50, #fafafa);
}

.n-card--elevated {
  box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1));
}

.n-card--padded > .n-card__body {
  padding: var(--spacing-5, 1.25rem);
}

.n-card--padded > .n-card__header {
  padding: var(--spacing-4, 1rem) var(--spacing-5, 1.25rem);
}

.n-card--padded > .n-card__footer {
  padding: var(--spacing-4, 1rem) var(--spacing-5, 1.25rem);
}

.n-card__header {
  border-bottom: var(--borderWidth-1, 1px) solid var(--color-neutral-200, #e5e5e5);
}

.n-card__footer {
  border-top: var(--borderWidth-1, 1px) solid var(--color-neutral-200, #e5e5e5);
}
</style>
