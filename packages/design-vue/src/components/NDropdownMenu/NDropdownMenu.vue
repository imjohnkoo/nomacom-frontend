<template>
  <DropdownMenuRoot>
    <DropdownMenuTrigger as-child>
      <slot />
    </DropdownMenuTrigger>
    <DropdownMenuPortal>
      <DropdownMenuContent
        :side-offset="5"
        class="n-dropdown-menu__content"
      >
        <template v-for="(group, groupIndex) in items" :key="groupIndex">
          <DropdownMenuSeparator
            v-if="groupIndex > 0"
            class="n-dropdown-menu__separator"
          />
          <DropdownMenuGroup>
            <DropdownMenuItem
              v-for="(item, itemIndex) in group"
              :key="itemIndex"
              :disabled="item.disabled"
              :class="[
                'n-dropdown-menu__item',
                item.color && `n-dropdown-menu__item--${item.color}`,
              ]"
              @select="$emit('select', item)"
            >
              <span v-if="item.icon" class="n-dropdown-menu__icon">
                <span :class="['n-icon', item.icon]" />
              </span>
              <span class="n-dropdown-menu__label">{{ item.label }}</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </template>
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
</template>

<script setup lang="ts">
import {
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from 'reka-ui'

export interface NDropdownMenuItem {
  /** Display label */
  label: string
  /** Optional icon class */
  icon?: string
  /** Whether the item is disabled */
  disabled?: boolean
  /** Optional color variant (e.g. 'error' for destructive actions) */
  color?: string
}

export interface NDropdownMenuProps {
  /** Groups of menu items, each group separated by a divider */
  items?: NDropdownMenuItem[][]
}

withDefaults(defineProps<NDropdownMenuProps>(), {
  items: () => [],
})

defineEmits<{
  select: [item: NDropdownMenuItem]
}>()
</script>

<style>
.n-dropdown-menu__content {
  z-index: var(--n-z-index-dropdown, 1000);
  min-width: 180px;
  max-width: 280px;
  padding: var(--n-spacing-1, 0.25rem);
  border-radius: var(--n-radius-lg, 0.5rem);
  background-color: var(--n-color-neutral-0, #ffffff);
  border: var(--n-border-width-1, 1px) solid var(--n-color-neutral-200, #e5e5e5);
  box-shadow: var(--n-shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
  font-family: var(--n-font-family-sans, 'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Segoe UI', 'Noto Sans KR', sans-serif);
  animation: n-dropdown-enter var(--n-transition-fast, 150ms ease) ease;
  will-change: transform, opacity;
}

.n-dropdown-menu__content:focus {
  outline: none;
}

.n-dropdown-menu__separator {
  height: 1px;
  margin: var(--n-spacing-1, 0.25rem) 0;
  background-color: var(--n-color-neutral-200, #e5e5e5);
}

.n-dropdown-menu__item {
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

.n-dropdown-menu__item:hover,
.n-dropdown-menu__item[data-highlighted] {
  background-color: var(--n-color-neutral-100, #f5f5f5);
  color: var(--n-color-neutral-900, #171717);
}

.n-dropdown-menu__item[data-disabled] {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.n-dropdown-menu__item--error {
  color: var(--n-color-error-500, #ef4444);
}

.n-dropdown-menu__item--error:hover,
.n-dropdown-menu__item--error[data-highlighted] {
  background-color: var(--n-color-error-50, #fef2f2);
  color: var(--n-color-error-700, #b91c1c);
}

.n-dropdown-menu__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: var(--n-color-neutral-500, #737373);
}

.n-dropdown-menu__item--error .n-dropdown-menu__icon {
  color: inherit;
}

.n-dropdown-menu__label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@keyframes n-dropdown-enter {
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
