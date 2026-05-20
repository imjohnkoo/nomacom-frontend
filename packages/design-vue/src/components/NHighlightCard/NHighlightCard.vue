<template>
  <div :class="['n-highlight-card', `n-highlight-card--${variant}`]">
    <span v-if="$slots.icon" class="n-highlight-card__icon" aria-hidden="true">
      <slot name="icon" />
    </span>
    <div class="n-highlight-card__body">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
export type NHighlightCardVariant = 'brand-gradient' | 'plain'

export interface NHighlightCardProps {
  variant?: NHighlightCardVariant
}

withDefaults(defineProps<NHighlightCardProps>(), {
  variant: 'brand-gradient',
})
</script>

<style scoped>
.n-highlight-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: var(--radius-2xl, 1rem);
  font-family: var(--font-fontFamily-sans, sans-serif);
}

.n-highlight-card--brand-gradient {
  background: linear-gradient(
    135deg,
    var(--color-primary-50, #f1edff),
    var(--color-neutral-0, #ffffff)
  );
  border: 1px solid var(--color-primary-100, #e3dbff);
}

.n-highlight-card--plain {
  background-color: var(--color-neutral-50, #fafafa);
  border: 1px solid transparent;
}

.n-highlight-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full, 9999px);
  background-color: var(--color-neutral-0, #ffffff);
  color: var(--color-primary-500, #6239ff);
}

.n-highlight-card__body {
  font-size: 12.5px;
  line-height: 1.55;
  color: var(--color-neutral-700, #404040);
}
</style>
