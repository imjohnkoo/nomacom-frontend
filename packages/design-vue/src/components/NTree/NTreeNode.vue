<template>
  <div class="n-tree-node" role="treeitem" :aria-expanded="hasChildren ? item.expanded : undefined">
    <div
      :class="[
        'n-tree-node__row',
        {
          'n-tree-node__row--selected': selectedValue === item.value,
        },
      ]"
      :style="{ paddingLeft: `${depth * 20 + 8}px` }"
      tabindex="0"
      @click="$emit('select', item.value)"
      @keydown.enter="$emit('select', item.value)"
    >
      <button
        v-if="hasChildren"
        type="button"
        class="n-tree-node__toggle"
        :aria-label="item.expanded ? 'Collapse' : 'Expand'"
        @click.stop="$emit('toggle', item)"
      >
        <svg
          :class="['n-tree-node__chevron', { 'n-tree-node__chevron--expanded': item.expanded }]"
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
        >
          <path
            d="M5 3L9 7L5 11"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <span v-else class="n-tree-node__spacer" />
      <span v-if="item.icon" class="n-tree-node__icon">{{ item.icon }}</span>
      <span class="n-tree-node__label">{{ item.label }}</span>
    </div>

    <div v-if="hasChildren && item.expanded" class="n-tree-node__children" role="group">
      <NTreeNode
        v-for="child in item.children"
        :key="child.value"
        :item="child"
        :depth="depth + 1"
        :selected-value="selectedValue"
        @select="$emit('select', $event)"
        @toggle="$emit('toggle', $event)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, type PropType } from 'vue'
import type { TreeItem } from './NTree.vue'

export default defineComponent({
  name: 'NTreeNode',
  props: {
    item: {
      type: Object as PropType<TreeItem>,
      required: true,
    },
    depth: {
      type: Number,
      required: true,
    },
    selectedValue: {
      type: String,
      default: undefined,
    },
  },
  emits: ['select', 'toggle'],
  setup(props) {
    const hasChildren = computed(() => {
      return props.item.children && props.item.children.length > 0
    })

    return { hasChildren }
  },
})
</script>

<style scoped>
.n-tree-node {
  width: 100%;
}

.n-tree-node__row {
  display: flex;
  align-items: center;
  gap: var(--spacing-1, 0.25rem);
  padding: var(--spacing-1, 0.25rem) var(--spacing-2, 0.5rem);
  border-radius: var(--radius-md, 0.375rem);
  cursor: pointer;
  transition: background-color var(--transition-fast, 150ms ease);
  outline: none;
  user-select: none;
}

.n-tree-node__row:hover {
  background-color: var(--color-neutral-50, #fafafa);
}

.n-tree-node__row:focus-visible {
  box-shadow: inset 0 0 0 2px var(--color-primary-500, #3b82f6);
}

.n-tree-node__row--selected {
  background-color: var(--color-primary-50, #eff6ff);
  color: var(--color-primary-700, #1d4ed8);
}

.n-tree-node__toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
  color: var(--color-neutral-500, #737373);
  border-radius: var(--radius-sm, 0.25rem);
  flex-shrink: 0;
}

.n-tree-node__toggle:hover {
  background-color: var(--color-neutral-100, #f5f5f5);
}

.n-tree-node__spacer {
  width: 20px;
  flex-shrink: 0;
}

.n-tree-node__chevron {
  transition: transform var(--transition-fast, 150ms ease);
}

.n-tree-node__chevron--expanded {
  transform: rotate(90deg);
}

.n-tree-node__icon {
  font-size: var(--font-fontSize-base, 1rem);
  flex-shrink: 0;
}

.n-tree-node__label {
  font-size: var(--font-fontSize-sm, 0.875rem);
  color: inherit;
  line-height: 1.5;
}
</style>
