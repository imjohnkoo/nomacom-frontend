<template>
  <div :class="layoutClasses" :style="layoutStyles">
    <aside class="n-dashboard__sidebar">
      <slot name="sidebar" />
    </aside>
    <header v-if="$slots.header" class="n-dashboard__header">
      <slot name="header" />
    </header>
    <main class="n-dashboard__content">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface NDashboardLayoutProps {
  sidebarWidth?: string
  sidebarCollapsed?: boolean
}

const props = withDefaults(defineProps<NDashboardLayoutProps>(), {
  sidebarWidth: '260px',
  sidebarCollapsed: false,
})

const layoutClasses = computed(() => [
  'n-dashboard',
  { 'n-dashboard--collapsed': props.sidebarCollapsed },
])

const layoutStyles = computed(() => ({
  '--n-dashboard-sidebar-width': props.sidebarCollapsed
    ? 'var(--n-dashboard-sidebar-collapsed-width, 72px)'
    : props.sidebarWidth,
}))
</script>

<style>
.n-dashboard {
  display: grid;
  grid-template-columns: var(--n-dashboard-sidebar-width, 260px) 1fr;
  grid-template-rows: auto 1fr;
  grid-template-areas:
    'sidebar header'
    'sidebar content';
  min-height: 100vh;
  transition: grid-template-columns 200ms ease;
}

.n-dashboard__sidebar {
  grid-area: sidebar;
  position: sticky;
  top: 0;
  height: 100vh;
  z-index: 10;
}

.n-dashboard__header {
  grid-area: header;
  position: sticky;
  top: 0;
  z-index: 5;
  background-color: var(--color-neutral-0, #ffffff);
  border-bottom: var(--borderWidth-1, 1px) solid var(--color-neutral-200, #e5e5e5);
}

.n-dashboard__content {
  grid-area: content;
  min-width: 0;
  background-color: var(--color-neutral-50, #fafafa);
}
</style>
