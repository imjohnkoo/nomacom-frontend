<template>
  <aside
    :class="sidebarClasses"
    :style="sidebarStyles"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <div class="n-sidebar__logo">
      <slot name="logo" :collapsed="visualCollapsed">
        <router-link v-if="!visualCollapsed" to="/" class="n-sidebar__logo-full">
          <slot name="logo-full" />
        </router-link>
        <span v-else class="n-sidebar__logo-mini">
          <slot name="logo-mini" />
        </span>
      </slot>
    </div>

    <nav class="n-sidebar__nav">
      <slot :collapsed="visualCollapsed" />
    </nav>

    <div v-if="$slots.footer" class="n-sidebar__footer">
      <slot name="footer" :collapsed="visualCollapsed" />
    </div>

    <button
      v-if="collapsible"
      class="n-sidebar__toggle"
      :aria-label="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
      @click="toggleCollapsed"
    >
      <svg
        class="n-sidebar__toggle-icon"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <rect x="3" y="4" width="2" height="12" rx="1" />
        <path
          fill-rule="evenodd"
          d="M14.78 5.22a.75.75 0 0 1 0 1.06L11.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
          clip-rule="evenodd"
        />
      </svg>
    </button>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

export interface NSidebarProps {
  collapsed?: boolean
  collapsible?: boolean
  width?: string
  collapsedWidth?: string
  theme?: 'dark' | 'light'
}

const props = withDefaults(defineProps<NSidebarProps>(), {
  collapsed: false,
  collapsible: true,
  width: undefined,
  collapsedWidth: undefined,
  theme: 'dark',
})

const emit = defineEmits<{
  'update:collapsed': [value: boolean]
}>()

const isCollapsed = computed(() => props.collapsed)

const hoverLocked = ref(false)
const isHovering = ref(false)

const visualCollapsed = computed(
  () => isCollapsed.value && (!isHovering.value || hoverLocked.value),
)

const sidebarClasses = computed(() => [
  'n-sidebar',
  {
    'n-sidebar--collapsed': isCollapsed.value,
    'n-sidebar--hover-locked': hoverLocked.value,
    'n-sidebar--light': props.theme === 'light',
  },
])

const sidebarStyles = computed(() => {
  const styles: Record<string, string> = {}
  if (props.width) styles['--n-sidebar-width'] = props.width
  if (props.collapsedWidth) styles['--n-sidebar-collapsed-width'] = props.collapsedWidth
  return styles
})

function toggleCollapsed() {
  const newCollapsed = !isCollapsed.value
  emit('update:collapsed', newCollapsed)
  if (newCollapsed) {
    hoverLocked.value = true
  }
}

function onMouseEnter() {
  isHovering.value = true
}

function onMouseLeave() {
  isHovering.value = false
  hoverLocked.value = false
}
</script>

<style>
.n-sidebar {
  display: flex;
  flex-direction: column;
  width: var(--n-sidebar-width, 260px);
  height: 100%;
  background-color: var(--color-neutral-900, #171717);
  color: var(--color-neutral-300, #d4d4d4);
  transition: width 200ms ease;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
  z-index: 10;
}

.n-sidebar--collapsed {
  width: var(--n-sidebar-collapsed-width, 72px);
}

.n-sidebar--collapsed:not(.n-sidebar--hover-locked):hover {
  width: var(--n-sidebar-width, 260px);
  box-shadow: var(--shadow-xl, 0 20px 25px -5px rgb(0 0 0 / 0.1));
}

.n-sidebar--light {
  background-color: var(--color-neutral-0, #ffffff);
  color: var(--color-neutral-700, #404040);
  border-right: var(--borderWidth-1, 1px) solid var(--color-neutral-200, #e5e5e5);
}

.n-sidebar__logo {
  display: flex;
  align-items: center;
  padding: var(--spacing-5, 1.25rem) var(--spacing-4, 1rem);
  flex-shrink: 0;
  min-height: 64px;
}

.n-sidebar__logo a {
  text-decoration: none;
  color: inherit;
}

.n-sidebar__nav {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--spacing-2, 0.5rem);
}

.n-sidebar__nav::-webkit-scrollbar {
  width: 4px;
}

.n-sidebar__nav::-webkit-scrollbar-thumb {
  background-color: rgb(255 255 255 / 0.2);
  border-radius: 2px;
}

.n-sidebar--light .n-sidebar__nav::-webkit-scrollbar-thumb {
  background-color: var(--color-neutral-300, #d4d4d4);
}

.n-sidebar__footer {
  flex-shrink: 0;
  padding: var(--spacing-2, 0.5rem);
  border-top: 1px solid rgb(255 255 255 / 0.1);
}

.n-sidebar--light .n-sidebar__footer {
  border-top-color: var(--color-neutral-200, #e5e5e5);
}

.n-sidebar__toggle {
  position: absolute;
  top: 50%;
  right: -12px;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  border-radius: var(--radius-full, 9999px);
  border: var(--borderWidth-1, 1px) solid var(--color-neutral-200, #e5e5e5);
  background-color: var(--color-neutral-0, #ffffff);
  color: var(--color-neutral-500, #737373);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 150ms ease;
  z-index: 20;
}

.n-sidebar:hover .n-sidebar__toggle {
  opacity: 1;
}

.n-sidebar__toggle:hover {
  background-color: var(--color-neutral-100, #f5f5f5);
}

.n-sidebar__toggle-icon {
  width: 14px;
  height: 14px;
  transition: transform 200ms ease;
}

.n-sidebar--collapsed .n-sidebar__toggle-icon {
  transform: rotate(180deg);
}
</style>
