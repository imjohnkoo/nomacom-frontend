<script setup lang="ts">
export interface BreadcrumbItem {
  label: string
  href?: string
  icon?: string
}

export interface NBreadcrumbProps {
  items?: BreadcrumbItem[]
  separator?: string
}

const props = withDefaults(defineProps<NBreadcrumbProps>(), {
  items: () => [],
  separator: '/',
})
</script>

<template>
  <nav
    aria-label="Breadcrumb"
    class="n-breadcrumb"
  >
    <ol class="n-breadcrumb__list">
      <li
        v-for="(item, index) in props.items"
        :key="index"
        class="n-breadcrumb__item"
      >
        <span
          v-if="index > 0"
          class="n-breadcrumb__separator"
          aria-hidden="true"
        >
          {{ props.separator }}
        </span>

        <!-- Current page (last item) -->
        <span
          v-if="index === props.items.length - 1"
          class="n-breadcrumb__current"
          aria-current="page"
        >
          <span
            v-if="item.icon"
            class="n-breadcrumb__icon"
            aria-hidden="true"
          >
            {{ item.icon }}
          </span>
          {{ item.label }}
        </span>

        <!-- Linked item -->
        <a
          v-else-if="item.href"
          :href="item.href"
          class="n-breadcrumb__link"
        >
          <span
            v-if="item.icon"
            class="n-breadcrumb__icon"
            aria-hidden="true"
          >
            {{ item.icon }}
          </span>
          {{ item.label }}
        </a>

        <!-- Non-linked item (not last) -->
        <span
          v-else
          class="n-breadcrumb__text"
        >
          <span
            v-if="item.icon"
            class="n-breadcrumb__icon"
            aria-hidden="true"
          >
            {{ item.icon }}
          </span>
          {{ item.label }}
        </span>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.n-breadcrumb {
  font-family: var(--font-fontFamily-sans);
  font-size: var(--font-fontSize-sm);
}

.n-breadcrumb__list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-1);
  list-style: none;
  margin: 0;
  padding: 0;
}

.n-breadcrumb__item {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
}

.n-breadcrumb__separator {
  color: var(--color-neutral-400);
  user-select: none;
  font-weight: var(--font-fontWeight-regular);
}

.n-breadcrumb__link {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1);
  color: var(--color-neutral-500);
  text-decoration: none;
  font-weight: var(--font-fontWeight-medium);
  border-radius: var(--radius-sm);
  padding: var(--spacing-0) var(--spacing-1);
  transition: color var(--transition-fast), background-color var(--transition-fast);
}

.n-breadcrumb__link:hover {
  color: var(--color-primary-600);
  background-color: var(--color-primary-50);
}

.n-breadcrumb__link:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

.n-breadcrumb__text {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1);
  color: var(--color-neutral-500);
  font-weight: var(--font-fontWeight-medium);
  padding: var(--spacing-0) var(--spacing-1);
}

.n-breadcrumb__current {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1);
  color: var(--color-neutral-900);
  font-weight: var(--font-fontWeight-semibold);
  padding: var(--spacing-0) var(--spacing-1);
}

.n-breadcrumb__icon {
  display: inline-flex;
  align-items: center;
  font-size: var(--font-fontSize-base);
}
</style>
