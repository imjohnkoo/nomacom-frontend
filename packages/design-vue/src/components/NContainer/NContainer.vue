<template>
  <div :class="['n-container', `n-container--${size}`]">
    <slot />
  </div>
</template>

<script setup lang="ts">
export interface NContainerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

withDefaults(defineProps<NContainerProps>(), {
  size: 'lg',
})
</script>

<style scoped>
.n-container {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-left: var(--spacing-4, 1rem);
  padding-right: var(--spacing-4, 1rem);
}

.n-container--sm {
  max-width: 640px;
}

.n-container--md {
  max-width: 768px;
}

.n-container--lg {
  max-width: 1024px;
}

.n-container--xl {
  max-width: 1280px;
}

.n-container--full {
  max-width: 100%;
}
</style>
