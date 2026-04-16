<script setup lang="ts">
import {
  PaginationRoot,
  PaginationList,
  PaginationListItem,
  PaginationFirst,
  PaginationLast,
  PaginationPrev,
  PaginationNext,
  PaginationEllipsis,
} from 'reka-ui'
import { computed } from 'vue'

export interface NPaginationProps {
  modelValue?: number
  total?: number
  perPage?: number
  siblingCount?: number
  showFirst?: boolean
  showLast?: boolean
}

export interface NPaginationEmits {
  (e: 'update:modelValue', value: number): void
}

const props = withDefaults(defineProps<NPaginationProps>(), {
  modelValue: 1,
  total: 0,
  perPage: 10,
  siblingCount: 1,
  showFirst: false,
  showLast: false,
})

const emit = defineEmits<NPaginationEmits>()

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.perPage)))

function handlePageChange(page: number) {
  emit('update:modelValue', page)
}
</script>

<template>
  <PaginationRoot
    :page="props.modelValue"
    :items-per-page="props.perPage"
    :total="props.total"
    :sibling-count="props.siblingCount"
    :show-edges="props.showFirst || props.showLast"
    class="n-pagination"
    @update:page="handlePageChange"
  >
    <PaginationList
      v-slot="{ items }"
      class="n-pagination__list"
    >
      <PaginationFirst
        v-if="props.showFirst"
        class="n-pagination__button n-pagination__button--edge"
        :disabled="props.modelValue <= 1"
      >
        <span aria-hidden="true">&laquo;</span>
        <span class="n-pagination__sr-only">First page</span>
      </PaginationFirst>

      <PaginationPrev
        class="n-pagination__button n-pagination__button--nav"
        :disabled="props.modelValue <= 1"
      >
        <span aria-hidden="true">&lsaquo;</span>
        <span class="n-pagination__sr-only">Previous page</span>
      </PaginationPrev>

      <template
        v-for="(item, index) in items"
        :key="index"
      >
        <PaginationListItem
          v-if="item.type === 'page'"
          :value="item.value"
          class="n-pagination__button n-pagination__button--page"
          :class="{ 'n-pagination__button--active': item.value === props.modelValue }"
        >
          {{ item.value }}
        </PaginationListItem>

        <PaginationEllipsis
          v-else
          :index="index"
          class="n-pagination__ellipsis"
        >
          &hellip;
        </PaginationEllipsis>
      </template>

      <PaginationNext
        class="n-pagination__button n-pagination__button--nav"
        :disabled="props.modelValue >= totalPages"
      >
        <span aria-hidden="true">&rsaquo;</span>
        <span class="n-pagination__sr-only">Next page</span>
      </PaginationNext>

      <PaginationLast
        v-if="props.showLast"
        class="n-pagination__button n-pagination__button--edge"
        :disabled="props.modelValue >= totalPages"
      >
        <span aria-hidden="true">&raquo;</span>
        <span class="n-pagination__sr-only">Last page</span>
      </PaginationLast>
    </PaginationList>
  </PaginationRoot>
</template>

<style scoped>
.n-pagination {
  font-family: var(--font-fontFamily-sans);
}

.n-pagination__list {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  list-style: none;
  margin: 0;
  padding: 0;
}

.n-pagination__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
  padding: var(--spacing-1) var(--spacing-2);
  font-family: var(--font-fontFamily-sans);
  font-size: var(--font-fontSize-sm);
  font-weight: var(--font-fontWeight-medium);
  color: var(--color-neutral-600);
  background-color: var(--color-neutral-0);
  border: var(--borderWidth-1) solid var(--color-neutral-200);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition:
    color var(--transition-fast),
    background-color var(--transition-fast),
    border-color var(--transition-fast);
}

.n-pagination__button:hover:not(:disabled) {
  background-color: var(--color-neutral-50);
  border-color: var(--color-neutral-300);
}

.n-pagination__button:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

.n-pagination__button:disabled {
  color: var(--color-neutral-300);
  cursor: not-allowed;
  background-color: var(--color-neutral-50);
  border-color: var(--color-neutral-100);
}

.n-pagination__button--active {
  color: var(--color-neutral-0);
  background-color: var(--color-primary-600);
  border-color: var(--color-primary-600);
}

.n-pagination__button--active:hover:not(:disabled) {
  background-color: var(--color-primary-700);
  border-color: var(--color-primary-700);
}

.n-pagination__ellipsis {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
  font-size: var(--font-fontSize-sm);
  color: var(--color-neutral-400);
  user-select: none;
}

.n-pagination__sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
