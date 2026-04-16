<template>
  <div class="n-data-table-wrap">
    <!-- Toolbar -->
    <div v-if="hasToolbar" class="n-data-table__toolbar">
      <div class="n-data-table__toolbar-left">
        <slot name="toolbar-left">
          <span v-if="pagination && totalItems" class="n-data-table__summary">
            {{ summaryText }}
          </span>
        </slot>
      </div>
      <div class="n-data-table__toolbar-right">
        <slot name="toolbar" />
      </div>
    </div>

    <div class="n-data-table-container">
      <table class="n-data-table">
        <thead class="n-data-table__head">
          <tr>
            <th v-if="selectable" class="n-data-table__th n-data-table__th--checkbox">
              <NCheckbox
                :model-value="isAllSelected"
                :indeterminate="isIndeterminate"
                @update:model-value="toggleSelectAll"
              />
            </th>
            <th
              v-for="col in columns"
              :key="col.key"
              :class="[
                'n-data-table__th',
                { 'n-data-table__th--sortable': col.sortable },
                col.align ? `n-data-table__th--${col.align}` : '',
              ]"
              :style="col.width ? { width: col.width } : undefined"
              @click="col.sortable ? toggleSort(col.key) : undefined"
            >
              <slot :name="`header-${col.key}`" :column="col">
                <span class="n-data-table__th-content">
                  {{ col.label }}
                  <span v-if="col.sortable" class="n-data-table__sort-icon">
                    <svg
                      v-if="sortKey === col.key && sortOrder === 'asc'"
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                    >
                      <path d="M5 5.5L7 3.5L9 5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                      <path d="M5 8.5L7 10.5L9 8.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.3" />
                    </svg>
                    <svg
                      v-else-if="sortKey === col.key && sortOrder === 'desc'"
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                    >
                      <path d="M5 5.5L7 3.5L9 5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.3" />
                      <path d="M5 8.5L7 10.5L9 8.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    <svg v-else width="14" height="14" viewBox="0 0 14 14" fill="none" opacity="0.3">
                      <path d="M5 5.5L7 3.5L9 5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                      <path d="M5 8.5L7 10.5L9 8.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </span>
                </span>
              </slot>
            </th>
          </tr>
        </thead>
        <tbody class="n-data-table__body">
          <tr v-if="loading">
            <td :colspan="totalColspan" class="n-data-table__loading">
              <NTableSkeleton :rows="pageSize || 5" :columns="columns.length" />
            </td>
          </tr>
          <template v-else-if="data.length > 0">
            <tr
              v-for="(row, rowIndex) in data"
              :key="rowKey ? row[rowKey] : rowIndex"
              :class="[
                'n-data-table__row',
                { 'n-data-table__row--clickable': rowClickable },
                { 'n-data-table__row--selected': selectable && isRowSelected(row) },
              ]"
              @click="rowClickable ? $emit('row-click', row) : undefined"
            >
              <td
                v-if="selectable"
                class="n-data-table__td n-data-table__td--checkbox"
                @click.stop
              >
                <NCheckbox
                  :model-value="isRowSelected(row)"
                  @update:model-value="toggleRowSelection(row, $event)"
                />
              </td>
              <td
                v-for="col in columns"
                :key="col.key"
                :class="[
                  'n-data-table__td',
                  col.align ? `n-data-table__td--${col.align}` : '',
                ]"
              >
                <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]" :index="rowIndex">
                  {{ row[col.key] }}
                </slot>
              </td>
            </tr>
          </template>
          <tr v-else>
            <td :colspan="totalColspan" class="n-data-table__empty">
              <slot name="empty">
                <div class="n-data-table__empty-content">
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <rect x="4" y="8" width="32" height="24" rx="3" stroke="currentColor" stroke-width="1.5" />
                    <path d="M4 16h32M16 16v16" stroke="currentColor" stroke-width="1.5" />
                  </svg>
                  <p>{{ emptyText }}</p>
                </div>
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="pagination && totalPages > 1" class="n-data-table__footer">
      <div class="n-data-table__footer-left">
        <template v-if="pageSizeOptions?.length">
          <span class="n-data-table__page-size-label">Show</span>
          <select :value="pageSize" class="n-data-table__page-size-select" @change="onPageSizeChange">
            <option v-for="opt in pageSizeOptions" :key="opt" :value="opt">{{ opt }}</option>
          </select>
          <span class="n-data-table__page-size-label">per page</span>
        </template>
      </div>
      <div class="n-data-table__footer-right">
        <NPagination
          :model-value="page"
          :total="totalItems"
          :per-page="pageSize"
          @update:model-value="$emit('update:page', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type Slots, computed, useSlots } from 'vue'
import { NCheckbox } from '../NCheckbox'
import { NPagination } from '../NPagination'
import NTableSkeleton from '../NSkeleton/NTableSkeleton.vue'

export interface NDataTableColumn {
  key: string
  label: string
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
  width?: string
}

export interface NDataTableProps {
  columns: NDataTableColumn[]
  data: Record<string, any>[]
  rowKey?: string
  rowClickable?: boolean
  emptyText?: string
  loading?: boolean
  sortKey?: string
  sortOrder?: 'asc' | 'desc'
  pagination?: boolean
  page?: number
  pageSize?: number
  totalItems?: number
  pageSizeOptions?: number[]
  selectable?: boolean
  selectedRows?: any[]
}

const props = withDefaults(defineProps<NDataTableProps>(), {
  rowKey: undefined,
  rowClickable: false,
  emptyText: 'No data available',
  loading: false,
  sortKey: undefined,
  sortOrder: 'desc',
  pagination: false,
  page: 1,
  pageSize: 20,
  totalItems: 0,
  pageSizeOptions: undefined,
  selectable: false,
  selectedRows: undefined,
})

const emit = defineEmits<{
  'row-click': [row: Record<string, any>]
  'update:page': [page: number]
  'update:pageSize': [size: number]
  sort: [payload: { key: string; order: 'asc' | 'desc' }]
  'update:selectedRows': [keys: any[]]
}>()

const slots: Slots = useSlots()

const totalPages = computed(() =>
  props.totalItems ? Math.ceil(props.totalItems / props.pageSize) : 0,
)

const totalColspan = computed(() => props.columns.length + (props.selectable ? 1 : 0))

const hasToolbar = computed(() => !!slots.toolbar || !!slots['toolbar-left'] || (props.pagination && props.totalItems))

const summaryText = computed(() => {
  if (!props.totalItems) return ''
  const start = (props.page - 1) * props.pageSize + 1
  const end = Math.min(props.page * props.pageSize, props.totalItems)
  return `Showing ${end - start + 1} of ${props.totalItems.toLocaleString()} items`
})

// Selection
function getRowKeyValue(row: Record<string, any>) {
  return props.rowKey ? row[props.rowKey] : props.data.indexOf(row)
}

function isRowSelected(row: Record<string, any>): boolean {
  const key = getRowKeyValue(row)
  return (props.selectedRows ?? []).includes(key)
}

const isAllSelected = computed(() => {
  if (!props.data.length) return false
  return props.data.every((row) => isRowSelected(row))
})

const isIndeterminate = computed(() => {
  if (!props.data.length) return false
  const someSelected = props.data.some((row) => isRowSelected(row))
  return someSelected && !isAllSelected.value
})

function toggleRowSelection(row: Record<string, any>, selected: boolean) {
  const key = getRowKeyValue(row)
  const current = [...(props.selectedRows ?? [])]
  if (selected) {
    if (!current.includes(key)) current.push(key)
  } else {
    const idx = current.indexOf(key)
    if (idx >= 0) current.splice(idx, 1)
  }
  emit('update:selectedRows', current)
}

function toggleSelectAll(selected: boolean) {
  if (selected) {
    emit('update:selectedRows', props.data.map((row) => getRowKeyValue(row)))
  } else {
    emit('update:selectedRows', [])
  }
}

// Pagination
function onPageSizeChange(event: Event) {
  emit('update:pageSize', Number((event.target as HTMLSelectElement).value))
}

// Sort
function toggleSort(key: string) {
  let order: 'asc' | 'desc' = 'asc'
  if (props.sortKey === key) {
    order = props.sortOrder === 'asc' ? 'desc' : 'asc'
  }
  emit('sort', { key, order })
}
</script>

<style scoped>
.n-data-table-wrap {
  border: var(--borderWidth-1, 1px) solid var(--color-neutral-200, #e5e5e5);
  border-radius: var(--radius-lg, 0.5rem);
  background-color: var(--color-neutral-0, #ffffff);
  font-family: var(--font-fontFamily-sans, sans-serif);
  overflow: hidden;
}

.n-data-table__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-3, 0.75rem) var(--spacing-4, 1rem);
  border-bottom: var(--borderWidth-1, 1px) solid var(--color-neutral-100, #f5f5f5);
}

.n-data-table__toolbar-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-2, 0.5rem);
}

.n-data-table__toolbar-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-2, 0.5rem);
}

.n-data-table__summary {
  font-size: var(--font-fontSize-sm, 0.875rem);
  color: var(--color-neutral-500, #737373);
}

.n-data-table-container {
  overflow-x: auto;
}

.n-data-table {
  width: 100%;
  border-collapse: collapse;
}

.n-data-table__head {
  background-color: var(--color-neutral-50, #fafafa);
  border-bottom: var(--borderWidth-1, 1px) solid var(--color-neutral-200, #e5e5e5);
}

.n-data-table__th {
  padding: var(--spacing-3, 0.75rem) var(--spacing-4, 1rem);
  font-size: var(--font-fontSize-sm, 0.875rem);
  font-weight: var(--font-fontWeight-semibold, 600);
  color: var(--color-neutral-600, #525252);
  text-align: left;
  white-space: nowrap;
}

.n-data-table__th--sortable {
  cursor: pointer;
  user-select: none;
}

.n-data-table__th--sortable:hover {
  color: var(--color-neutral-800, #262626);
}

.n-data-table__th--center { text-align: center; }
.n-data-table__th--right { text-align: right; }
.n-data-table__th--checkbox { width: 44px; }

.n-data-table__th-content {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1, 0.25rem);
}

.n-data-table__sort-icon {
  display: inline-flex;
  align-items: center;
}

.n-data-table__td {
  padding: var(--spacing-3, 0.75rem) var(--spacing-4, 1rem);
  font-size: var(--font-fontSize-sm, 0.875rem);
  color: var(--color-neutral-800, #262626);
  border-bottom: var(--borderWidth-1, 1px) solid var(--color-neutral-100, #f5f5f5);
}

.n-data-table__td--center { text-align: center; }
.n-data-table__td--right { text-align: right; }
.n-data-table__td--checkbox { width: 44px; }

.n-data-table__row:last-child .n-data-table__td {
  border-bottom: none;
}

.n-data-table__row--clickable {
  cursor: pointer;
}

.n-data-table__row--clickable:hover {
  background-color: var(--color-neutral-50, #fafafa);
}

.n-data-table__row--selected {
  background-color: var(--color-primary-50, #f5f3ff);
}

.n-data-table__loading td {
  padding: 0;
}

.n-data-table__empty {
  text-align: center;
  padding: var(--spacing-10, 2.5rem) var(--spacing-4, 1rem);
}

.n-data-table__empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-3, 0.75rem);
  color: var(--color-neutral-400, #a3a3a3);
}

.n-data-table__empty-content p {
  margin: 0;
  font-size: var(--font-fontSize-sm, 0.875rem);
}

.n-data-table__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-3, 0.75rem) var(--spacing-4, 1rem);
  border-top: var(--borderWidth-1, 1px) solid var(--color-neutral-200, #e5e5e5);
}

.n-data-table__footer-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-2, 0.5rem);
}

.n-data-table__footer-right {
  display: flex;
  align-items: center;
}

.n-data-table__page-size-label {
  font-size: var(--font-fontSize-sm, 0.875rem);
  color: var(--color-neutral-500, #737373);
}

.n-data-table__page-size-select {
  padding: var(--spacing-1, 0.25rem) var(--spacing-2, 0.5rem);
  border: var(--borderWidth-1, 1px) solid var(--color-neutral-300, #d4d4d4);
  border-radius: var(--radius-md, 0.375rem);
  font-size: var(--font-fontSize-sm, 0.875rem);
  font-family: inherit;
  background-color: var(--color-neutral-0, #ffffff);
  color: var(--color-neutral-700, #404040);
}
</style>
