<template>
  <header class="n-page-heading">
    <p v-if="eyebrow" class="n-page-heading__eyebrow">{{ eyebrow }}</p>
    <h1 class="n-page-heading__title">
      <slot name="title">{{ title }}</slot>
    </h1>
    <p v-if="description || $slots.description" class="n-page-heading__desc">
      <slot name="description">{{ description }}</slot>
    </p>
  </header>
</template>

<script setup lang="ts">
export interface NPageHeadingProps {
  title?: string
  description?: string
  eyebrow?: string
}

withDefaults(defineProps<NPageHeadingProps>(), {
  title: undefined,
  description: undefined,
  eyebrow: undefined,
})
</script>

<style scoped>
.n-page-heading {
  font-family: var(--font-fontFamily-sans, sans-serif);
}

.n-page-heading__eyebrow {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-primary-500, #6239ff);
}

.n-page-heading__title {
  margin: 0;
  font-size: 26px;
  line-height: 1.28;
  letter-spacing: -0.01em;
  font-weight: var(--font-fontWeight-bold, 700);
  color: var(--color-neutral-900, #171717);
  white-space: pre-line;
}

.n-page-heading__desc {
  margin: 12px 0 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-neutral-500, #737373);
  white-space: pre-line;
}
</style>
