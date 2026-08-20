<template>
  <ContextMenuRoot>
    <ContextMenuTrigger as-child>
      <slot />
    </ContextMenuTrigger>
    <ContextMenuPortal>
      <ContextMenuContent class="n-context-menu__content">
        <template v-for="(group, groupIndex) in items" :key="groupIndex">
          <ContextMenuSeparator
            v-if="groupIndex > 0"
            class="n-context-menu__separator"
          />
          <ContextMenuGroup>
            <ContextMenuItem
              v-for="(item, itemIndex) in group"
              :key="itemIndex"
              :disabled="item.disabled"
              class="n-context-menu__item"
              @select="$emit('select', item)"
            >
              <span v-if="item.icon" class="n-context-menu__icon">
                <span :class="['n-icon', item.icon]" />
              </span>
              <span class="n-context-menu__label">{{ item.label }}</span>
            </ContextMenuItem>
          </ContextMenuGroup>
        </template>
      </ContextMenuContent>
    </ContextMenuPortal>
  </ContextMenuRoot>
</template>

<script setup lang="ts">
import {
  ContextMenuRoot,
  ContextMenuTrigger,
  ContextMenuPortal,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSeparator,
} from 'reka-ui'

export interface NContextMenuItem {
  /** Display label */
  label: string
  /** Optional icon class */
  icon?: string
  /** Whether the item is disabled */
  disabled?: boolean
}

export interface NContextMenuProps {
  /** Groups of menu items, each group separated by a divider */
  items?: NContextMenuItem[][]
}

withDefaults(defineProps<NContextMenuProps>(), {
  items: () => [],
})

defineEmits<{
  select: [item: NContextMenuItem]
}>()
</script>

<style>
.n-context-menu__content {
  z-index: var(--n-z-index-dropdown, 1000);
  min-width: 180px;
  max-width: 280px;
  padding: var(--n-spacing-1, 0.25rem);
  border-radius: var(--n-radius-lg, 0.5rem);
  background-color: var(--n-color-neutral-0, #ffffff);
  border: var(--n-border-width-1, 1px) solid var(--n-color-neutral-200, #e5e5e5);
  box-shadow: var(--n-shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
  font-family: var(--n-font-family-sans, 'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Segoe UI', 'Noto Sans KR', sans-serif);
  animation: n-context-menu-enter var(--n-transition-fast, 150ms ease) ease;
  will-change: transform, opacity;
}

.n-context-menu__content:focus {
  outline: none;
}

.n-context-menu__separator {
  height: 1px;
  margin: var(--n-spacing-1, 0.25rem) 0;
  background-color: var(--n-color-neutral-200, #e5e5e5);
}

.n-context-menu__item {
  display: flex;
  align-items: center;
  gap: var(--n-spacing-2, 0.5rem);
  padding: var(--n-spacing-2, 0.5rem) var(--n-spacing-3, 0.75rem);
  border-radius: var(--n-radius-md, 0.375rem);
  font-size: var(--n-font-size-sm, 0.875rem);
  color: var(--n-color-neutral-700, #404040);
  cursor: pointer;
  user-select: none;
  outline: none;
  transition: background-color var(--n-transition-fast, 150ms ease);
}

.n-context-menu__item:hover,
.n-context-menu__item[data-highlighted] {
  background-color: var(--n-color-neutral-100, #f5f5f5);
  color: var(--n-color-neutral-900, #171717);
}

.n-context-menu__item[data-disabled] {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.n-context-menu__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: var(--n-color-neutral-500, #737373);
}

.n-context-menu__label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@keyframes n-context-menu-enter {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
