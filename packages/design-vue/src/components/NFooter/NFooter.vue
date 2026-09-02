<template>
  <footer
    :class="[
      'n-footer',
      {
        'n-footer--bordered': bordered,
      },
    ]"
  >
    <slot />
  </footer>
</template>

<script setup lang="ts">
export interface NFooterProps {
  bordered?: boolean
}

withDefaults(defineProps<NFooterProps>(), {
  bordered: true,
})
</script>

<style scoped>
.n-footer {
  display: flex;
  align-items: center;
  padding: var(--n-spacing-3, 0.75rem) var(--n-spacing-4, 1rem);
  background-color: var(--n-color-neutral-0, #ffffff);
  flex-shrink: 0;
}

.n-footer--bordered {
  border-top: var(--n-border-width-1, 1px) solid var(--n-color-neutral-200, #e5e5e5);
}
</style>
