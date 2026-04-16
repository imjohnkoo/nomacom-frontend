<template>
  <div class="n-sidebar-item-group" :style="depthStyle">
    <component
      :is="tag"
      v-bind="linkAttrs"
      :class="itemClasses"
      :title="collapsed ? label : undefined"
      :disabled="tag === 'button' ? disabled : undefined"
      @click="onClick"
    >
      <span v-if="$slots.icon" class="n-sidebar-item__icon">
        <slot name="icon" />
      </span>
      <span class="n-sidebar-item__label">{{ label }}</span>
      <span v-if="$slots.badge && !hasChildren" class="n-sidebar-item__badge">
        <slot name="badge" />
      </span>
      <span v-if="hasChildren" :class="chevronClasses">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M6 4l4 4-4 4"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
    </component>
    <div v-if="hasChildren" :class="childrenClasses">
      <div class="n-sidebar-item__children-inner">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'

export interface NSidebarItemProps {
  label: string
  to?: string
  href?: string
  active?: boolean
  collapsed?: boolean
  disabled?: boolean
  expanded?: boolean
  depth?: number
}

const props = withDefaults(defineProps<NSidebarItemProps>(), {
  to: undefined,
  href: undefined,
  active: false,
  collapsed: false,
  disabled: false,
  expanded: false,
  depth: 0,
})

const emit = defineEmits<{
  click: [event: Event]
  'update:expanded': [value: boolean]
}>()

const slots = useSlots()
const hasChildren = computed(() => !!slots.default)

const isExpanded = computed({
  get: () => props.expanded,
  set: (val: boolean) => emit('update:expanded', val),
})

const tag = computed(() => {
  if (hasChildren.value) return 'button'
  if (props.disabled) return 'button'
  if (props.to) return 'router-link'
  if (props.href) return 'a'
  return 'button'
})

const linkAttrs = computed(() => {
  if (hasChildren.value) return { type: 'button' }
  if (props.to && !props.disabled) return { to: props.to }
  if (props.href && !props.disabled) return { href: props.href }
  return { type: 'button' }
})

const itemClasses = computed(() => [
  'n-sidebar-item',
  {
    'n-sidebar-item--active': props.active,
    'n-sidebar-item--disabled': props.disabled,
    'n-sidebar-item--parent': hasChildren.value,
  },
])

const chevronClasses = computed(() => [
  'n-sidebar-item__chevron',
  { 'n-sidebar-item__chevron--open': isExpanded.value },
])

const childrenClasses = computed(() => [
  'n-sidebar-item__children',
  { 'n-sidebar-item__children--open': isExpanded.value },
])

const depthStyle = computed(() =>
  props.depth ? ({ '--n-sidebar-depth': props.depth } as Record<string, number>) : undefined,
)

function onClick(event: Event) {
  if (props.disabled) return
  if (hasChildren.value) {
    isExpanded.value = !isExpanded.value
  } else {
    emit('click', event)
  }
}
</script>

<style>
.n-sidebar-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-3, 0.75rem);
  width: 100%;
  padding: var(--spacing-2, 0.5rem) var(--spacing-4, 1rem);
  margin: 0 0 2px;
  border: none;
  border-radius: var(--radius-md, 0.375rem);
  background: transparent;
  color: inherit;
  font-family: var(--font-fontFamily-sans, sans-serif);
  font-size: var(--font-fontSize-sm, 0.875rem);
  font-weight: var(--font-fontWeight-medium, 500);
  text-decoration: none;
  cursor: pointer;
  transition: background-color 150ms ease, color 150ms ease;
  text-align: left;
  padding-left: calc(var(--spacing-4, 1rem) + var(--n-sidebar-depth, 0) * 12px);
}

.n-sidebar-item:hover:not(.n-sidebar-item--disabled) {
  background-color: rgb(255 255 255 / 0.08);
}

.n-sidebar-item--active {
  background-color: rgb(255 255 255 / 0.12);
  color: var(--color-primary-300, #c4b5fd);
}

.n-sidebar--light .n-sidebar-item:hover:not(.n-sidebar-item--disabled) {
  background-color: var(--color-neutral-100, #f5f5f5);
}

.n-sidebar--light .n-sidebar-item--active {
  background-color: var(--color-primary-50, #f5f3ff);
  color: var(--color-primary-600, #5530e6);
}

.n-sidebar-item--disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.n-sidebar-item__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  font-size: 16px;
}

.n-sidebar-item__label {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: opacity 200ms ease, width 200ms ease;
}

.n-sidebar-item__badge {
  flex-shrink: 0;
}

.n-sidebar-item__chevron {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  transition: transform 200ms ease;
  opacity: 0.6;
}

.n-sidebar-item__chevron--open {
  transform: rotate(90deg);
}

.n-sidebar-item__children {
  max-height: 0;
  overflow: hidden;
  transition: max-height 200ms ease;
}

.n-sidebar-item__children--open {
  max-height: 500px;
}

.n-sidebar-item__children-inner {
  padding: var(--spacing-1, 0.25rem) 0 var(--spacing-1, 0.25rem) var(--spacing-6, 1.5rem);
}

/* Collapsed state */
.n-sidebar--collapsed .n-sidebar-item__label,
.n-sidebar--collapsed .n-sidebar-item__badge,
.n-sidebar--collapsed .n-sidebar-item__chevron {
  opacity: 0;
  width: 0;
  overflow: hidden;
}

.n-sidebar--collapsed .n-sidebar-item {
  justify-content: center;
  padding-left: var(--spacing-4, 1rem);
  padding-right: var(--spacing-4, 1rem);
}

.n-sidebar--collapsed .n-sidebar-item__children {
  max-height: 0 !important;
}

/* Hover-expand: restore labels */
.n-sidebar--collapsed:not(.n-sidebar--hover-locked):hover .n-sidebar-item__label,
.n-sidebar--collapsed:not(.n-sidebar--hover-locked):hover .n-sidebar-item__badge,
.n-sidebar--collapsed:not(.n-sidebar--hover-locked):hover .n-sidebar-item__chevron {
  opacity: 1;
  width: auto;
}

.n-sidebar--collapsed:not(.n-sidebar--hover-locked):hover .n-sidebar-item {
  justify-content: flex-start;
}

.n-sidebar--collapsed:not(.n-sidebar--hover-locked):hover .n-sidebar-item__children--open {
  max-height: 500px;
}
</style>
