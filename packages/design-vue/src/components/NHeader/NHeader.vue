<template>
  <header
    :class="[
      'n-header',
      {
        'n-header--sticky': sticky,
        'n-header--bordered': bordered,
      },
    ]"
  >
    <slot />
  </header>
</template>

<script setup lang="ts">
export interface NHeaderProps {
  sticky?: boolean
  bordered?: boolean
}

withDefaults(defineProps<NHeaderProps>(), {
  sticky: true,
  bordered: true,
})
</script>

<style scoped>
.n-header {
  display: flex;
  align-items: center;
  padding: var(--spacing-3, 0.75rem) var(--spacing-4, 1rem);
  background-color: var(--color-neutral-0, #ffffff);
  z-index: var(--zIndex-sticky, 100);
  flex-shrink: 0;
}

.n-header--sticky {
  position: sticky;
  top: 0;
}

.n-header--bordered {
  border-bottom: var(--borderWidth-1, 1px) solid var(--color-neutral-200, #e5e5e5);
}
</style>
