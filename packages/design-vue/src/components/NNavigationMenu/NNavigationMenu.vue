<script setup lang="ts">
import {
  NavigationMenuRoot,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuViewport,
} from 'reka-ui'

export interface NavigationMenuChild {
  label: string
  href: string
  description?: string
}

export interface NavigationMenuItemDef {
  label: string
  href?: string
  children?: NavigationMenuChild[]
}

export interface NNavigationMenuProps {
  items?: NavigationMenuItemDef[]
}

const props = withDefaults(defineProps<NNavigationMenuProps>(), {
  items: () => [],
})
</script>

<template>
  <NavigationMenuRoot class="n-nav-menu">
    <NavigationMenuList class="n-nav-menu__list">
      <NavigationMenuItem
        v-for="(item, index) in props.items"
        :key="index"
        class="n-nav-menu__item"
      >
        <!-- Item with children (dropdown) -->
        <template v-if="item.children && item.children.length > 0">
          <NavigationMenuTrigger class="n-nav-menu__trigger">
            {{ item.label }}
            <span
              class="n-nav-menu__chevron"
              aria-hidden="true"
            >
              &#9662;
            </span>
          </NavigationMenuTrigger>

          <NavigationMenuContent class="n-nav-menu__content">
            <ul class="n-nav-menu__dropdown">
              <li
                v-for="(child, childIndex) in item.children"
                :key="childIndex"
                class="n-nav-menu__dropdown-item"
              >
                <NavigationMenuLink
                  :href="child.href"
                  class="n-nav-menu__dropdown-link"
                >
                  <span class="n-nav-menu__dropdown-label">
                    {{ child.label }}
                  </span>
                  <span
                    v-if="child.description"
                    class="n-nav-menu__dropdown-description"
                  >
                    {{ child.description }}
                  </span>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </template>

        <!-- Simple link item -->
        <NavigationMenuLink
          v-else
          :href="item.href"
          class="n-nav-menu__link"
        >
          {{ item.label }}
        </NavigationMenuLink>
      </NavigationMenuItem>
    </NavigationMenuList>

    <div class="n-nav-menu__viewport-wrapper">
      <NavigationMenuViewport class="n-nav-menu__viewport" />
    </div>
  </NavigationMenuRoot>
</template>

<style>
.n-nav-menu {
  font-family: var(--n-font-family-sans, 'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Segoe UI', 'Noto Sans KR', sans-serif);
  position: relative;
}

.n-nav-menu__list {
  display: flex;
  align-items: center;
  gap: var(--n-spacing-1, 0.25rem);
  list-style: none;
  margin: 0;
  padding: 0;
}

.n-nav-menu__item {
  position: relative;
}

.n-nav-menu__link,
.n-nav-menu__trigger {
  display: inline-flex;
  align-items: center;
  gap: var(--n-spacing-1, 0.25rem);
  padding: var(--n-spacing-2, 0.5rem) var(--n-spacing-3, 0.75rem);
  font-family: var(--n-font-family-sans, 'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Segoe UI', 'Noto Sans KR', sans-serif);
  font-size: var(--n-font-size-sm, 0.875rem);
  font-weight: var(--n-font-weight-medium, 500);
  color: var(--n-color-neutral-600, #525252);
  background: none;
  border: none;
  border-radius: var(--n-radius-md, 0.375rem);
  cursor: pointer;
  text-decoration: none;
  transition:
    color var(--n-transition-fast, 150ms ease),
    background-color var(--n-transition-fast, 150ms ease);
  white-space: nowrap;
}

.n-nav-menu__link:hover,
.n-nav-menu__trigger:hover {
  color: var(--n-color-neutral-900, #171717);
  background-color: var(--n-color-neutral-50, #fafafa);
}

.n-nav-menu__link:focus-visible,
.n-nav-menu__trigger:focus-visible {
  outline: 2px solid var(--n-color-primary-500, #6239FF);
  outline-offset: 2px;
}

.n-nav-menu__trigger[data-state='open'] {
  color: var(--n-color-primary-600, #5025e8);
  background-color: var(--n-color-primary-50, #f1edff);
}

.n-nav-menu__chevron {
  font-size: var(--n-font-size-xs, 0.75rem);
  transition: transform var(--n-transition-fast, 150ms ease);
}

.n-nav-menu__trigger[data-state='open'] .n-nav-menu__chevron {
  transform: rotate(180deg);
}

.n-nav-menu__viewport-wrapper {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: var(--n-z-index-dropdown, 1000);
  perspective: 2000px;
}

.n-nav-menu__viewport {
  position: relative;
  min-width: 240px;
  height: var(--reka-navigation-menu-viewport-height);
  overflow: hidden;
  margin-top: var(--n-spacing-1, 0.25rem);
  background-color: var(--n-color-neutral-0, #ffffff);
  border: var(--n-border-width-1, 1px) solid var(--n-color-neutral-200, #e5e5e5);
  border-radius: var(--n-radius-lg, 0.5rem);
  box-shadow: var(--n-shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
  transition: height 250ms ease;
}

.n-nav-menu__viewport[data-state='open'] {
  animation: n-nav-menu-enter 200ms ease-out;
}

.n-nav-menu__viewport[data-state='closed'] {
  animation: n-nav-menu-exit 200ms ease-in;
}

.n-nav-menu__content {
  padding: var(--n-spacing-2, 0.5rem);
  width: 100%;
}

@keyframes n-nav-menu-enter {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes n-nav-menu-exit {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-4px);
  }
}

.n-nav-menu__dropdown {
  list-style: none;
  margin: 0;
  padding: 0;
}

.n-nav-menu__dropdown-item {
  margin: 0;
}

.n-nav-menu__dropdown-link {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: var(--n-spacing-2, 0.5rem) var(--n-spacing-3, 0.75rem);
  border-radius: var(--n-radius-md, 0.375rem);
  text-decoration: none;
  transition:
    color var(--n-transition-fast, 150ms ease),
    background-color var(--n-transition-fast, 150ms ease);
}

.n-nav-menu__dropdown-link:hover {
  background-color: var(--n-color-primary-50, #f1edff);
}

.n-nav-menu__dropdown-link:focus-visible {
  outline: 2px solid var(--n-color-primary-500, #6239FF);
  outline-offset: -2px;
}

.n-nav-menu__dropdown-label {
  font-size: var(--n-font-size-sm, 0.875rem);
  font-weight: var(--n-font-weight-medium, 500);
  color: var(--n-color-neutral-900, #171717);
}

.n-nav-menu__dropdown-description {
  font-size: var(--n-font-size-xs, 0.75rem);
  font-weight: var(--n-font-weight-normal, 400);
  color: var(--n-color-neutral-500, #737373);
  line-height: 1.5;
}
</style>
