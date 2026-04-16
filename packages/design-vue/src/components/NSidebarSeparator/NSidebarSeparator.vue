<template>
  <div :class="separatorClasses">
    <span class="n-sidebar-separator__line" />
    <span v-if="label" class="n-sidebar-separator__label">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface NSidebarSeparatorProps {
  label?: string
}

const props = withDefaults(defineProps<NSidebarSeparatorProps>(), {
  label: undefined,
})

const separatorClasses = computed(() => [
  'n-sidebar-separator',
  { 'n-sidebar-separator--with-label': !!props.label },
])
</script>

<style>
.n-sidebar-separator {
  padding: var(--spacing-3, 0.75rem) var(--spacing-4, 1rem);
}

.n-sidebar-separator__line {
  display: block;
  height: 1px;
  background-color: currentColor;
  opacity: 0.15;
}

.n-sidebar-separator--with-label {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2, 0.5rem);
}

.n-sidebar-separator__label {
  font-size: var(--font-fontSize-xs, 0.75rem);
  font-weight: var(--font-fontWeight-semibold, 600);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.5;
}

.n-sidebar--collapsed .n-sidebar-separator__label {
  display: none;
}

.n-sidebar--collapsed:not(.n-sidebar--hover-locked):hover .n-sidebar-separator__label {
  display: block;
}
</style>
