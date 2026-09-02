<template>
  <footer class="n-footer-columns">
    <div class="n-footer-columns__grid">
      <div
        v-for="(column, colIndex) in columns"
        :key="colIndex"
        class="n-footer-columns__column"
      >
        <h4 class="n-footer-columns__title">{{ column.title }}</h4>
        <ul class="n-footer-columns__list">
          <li
            v-for="(item, itemIndex) in column.items"
            :key="itemIndex"
            class="n-footer-columns__item"
          >
            <a
              v-if="item.href"
              :href="item.href"
              class="n-footer-columns__link"
            >
              {{ item.label }}
            </a>
            <span v-else class="n-footer-columns__text">
              {{ item.label }}
            </span>
          </li>
        </ul>
      </div>
    </div>
  </footer>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';

export interface FooterColumnItem {
  label: string;
  href?: string;
}

export interface FooterColumn {
  title: string;
  items: FooterColumnItem[];
}

export interface NFooterColumnsProps {
  columns?: FooterColumn[]
}

export default defineComponent({
  name: 'NFooterColumns',

  props: {
    columns: {
      type: Array as PropType<FooterColumn[]>,
      default: () => [],
    },
  },
});
</script>

<style scoped>
.n-footer-columns {
  width: 100%;
  padding: var(--n-spacing-10) var(--n-spacing-6);
  font-family: var(--n-font-family-sans);
}

.n-footer-columns__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--n-spacing-8);
  max-width: 1200px;
  margin: 0 auto;
}

.n-footer-columns__column {
  display: flex;
  flex-direction: column;
}

.n-footer-columns__title {
  margin: 0 0 var(--n-spacing-4) 0;
  font-size: var(--n-font-size-sm);
  font-weight: var(--n-font-weight-semibold);
  color: var(--n-color-neutral-900);
  line-height: 1.4;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.n-footer-columns__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--n-spacing-2);
}

.n-footer-columns__item {
  line-height: 1.5;
}

.n-footer-columns__link {
  font-size: var(--n-font-size-sm);
  font-weight: var(--n-font-weight-normal);
  color: var(--n-color-neutral-500);
  text-decoration: none;
  transition: color var(--n-transition-fast);
}

.n-footer-columns__link:hover {
  color: var(--n-color-primary-500);
}

.n-footer-columns__link:focus-visible {
  outline: 2px solid var(--n-color-primary-500);
  outline-offset: 2px;
  border-radius: var(--n-radius-sm);
}

.n-footer-columns__text {
  font-size: var(--n-font-size-sm);
  font-weight: var(--n-font-weight-normal);
  color: var(--n-color-neutral-400);
}
</style>
