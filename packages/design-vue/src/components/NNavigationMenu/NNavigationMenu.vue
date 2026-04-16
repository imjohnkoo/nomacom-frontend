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
  font-family: var(--font-fontFamily-sans, sans-serif);
  position: relative;
}

.n-nav-menu__list {
  display: flex;
  align-items: center;
  gap: var(--spacing-1, 0.25rem);
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
  gap: var(--spacing-1, 0.25rem);
  padding: var(--spacing-2, 0.5rem) var(--spacing-3, 0.75rem);
  font-family: var(--font-fontFamily-sans, sans-serif);
  font-size: var(--font-fontSize-sm, 0.875rem);
  font-weight: var(--font-fontWeight-medium, 500);
  color: var(--color-neutral-600, #525252);
  background: none;
  border: none;
  border-radius: var(--radius-md, 0.375rem);
  cursor: pointer;
  text-decoration: none;
  transition:
    color var(--transition-fast, 150ms ease),
    background-color var(--transition-fast, 150ms ease);
  white-space: nowrap;
}

.n-nav-menu__link:hover,
.n-nav-menu__trigger:hover {
  color: var(--color-neutral-900, #171717);
  background-color: var(--color-neutral-50, #fafafa);
}

.n-nav-menu__link:focus-visible,
.n-nav-menu__trigger:focus-visible {
  outline: 2px solid var(--color-primary-500, #3b82f6);
  outline-offset: 2px;
}

.n-nav-menu__trigger[data-state='open'] {
  color: var(--color-primary-600, #2563eb);
  background-color: var(--color-primary-50, #eff6ff);
}

.n-nav-menu__chevron {
  font-size: var(--font-fontSize-xs, 0.75rem);
  transition: transform var(--transition-fast, 150ms ease);
}

.n-nav-menu__trigger[data-state='open'] .n-nav-menu__chevron {
  transform: rotate(180deg);
}

.n-nav-menu__viewport-wrapper {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: var(--zIndex-dropdown, 1000);
  perspective: 2000px;
}

.n-nav-menu__viewport {
  position: relative;
  min-width: 240px;
  height: var(--reka-navigation-menu-viewport-height);
  overflow: hidden;
  margin-top: var(--spacing-1, 0.25rem);
  background-color: var(--color-neutral-0, #ffffff);
  border: var(--borderWidth-1, 1px) solid var(--color-neutral-200, #e5e5e5);
  border-radius: var(--radius-lg, 0.5rem);
  box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
  transition: height 250ms ease;
}

.n-nav-menu__viewport[data-state='open'] {
  animation: n-nav-menu-enter 200ms ease-out;
}

.n-nav-menu__viewport[data-state='closed'] {
  animation: n-nav-menu-exit 200ms ease-in;
}

.n-nav-menu__content {
  padding: var(--spacing-2, 0.5rem);
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
  padding: var(--spacing-2, 0.5rem) var(--spacing-3, 0.75rem);
  border-radius: var(--radius-md, 0.375rem);
  text-decoration: none;
  transition:
    color var(--transition-fast, 150ms ease),
    background-color var(--transition-fast, 150ms ease);
}

.n-nav-menu__dropdown-link:hover {
  background-color: var(--color-primary-50, #eff6ff);
}

.n-nav-menu__dropdown-link:focus-visible {
  outline: 2px solid var(--color-primary-500, #3b82f6);
  outline-offset: -2px;
}

.n-nav-menu__dropdown-label {
  font-size: var(--font-fontSize-sm, 0.875rem);
  font-weight: var(--font-fontWeight-medium, 500);
  color: var(--color-neutral-900, #171717);
}

.n-nav-menu__dropdown-description {
  font-size: var(--font-fontSize-xs, 0.75rem);
  font-weight: var(--font-fontWeight-regular, 400);
  color: var(--color-neutral-500, #737373);
  line-height: 1.5;
}
</style>
