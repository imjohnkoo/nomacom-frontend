<template>
  <div class="n-table-wrapper">
    <table
      :class="[
        'n-table',
        {
          'n-table--striped': striped,
          'n-table--hoverable': hoverable,
          'n-table--compact': compact,
        },
      ]"
    >
      <thead class="n-table__head">
        <slot name="header">
          <tr class="n-table__row n-table__row--header">
            <th
              v-for="col in columns"
              :key="col.key"
              class="n-table__th"
              :style="{
                width: col.width || 'auto',
                textAlign: col.align || 'left',
              }"
            >
              {{ col.label }}
            </th>
          </tr>
        </slot>
      </thead>
      <tbody class="n-table__body">
        <slot>
          <tr
            v-for="(row, rowIndex) in data"
            :key="rowIndex"
            class="n-table__row"
          >
            <td
              v-for="col in columns"
              :key="col.key"
              class="n-table__td"
              :style="{ textAlign: col.align || 'left' }"
            >
              <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
                {{ row[col.key] }}
              </slot>
            </td>
          </tr>
        </slot>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
export interface NTableColumn {
  key: string
  label: string
  width?: string
  align?: 'left' | 'center' | 'right'
}

export interface NTableProps {
  columns?: NTableColumn[]
  data?: Record<string, any>[]
  striped?: boolean
  hoverable?: boolean
  compact?: boolean
}

withDefaults(defineProps<NTableProps>(), {
  columns: () => [],
  data: () => [],
  striped: false,
  hoverable: false,
  compact: false,
})
</script>

<style scoped>
.n-table-wrapper {
  width: 100%;
  overflow-x: auto;
  border: var(--borderWidth-1, 1px) solid var(--color-neutral-200, #e5e5e5);
  border-radius: var(--radius-lg, 0.5rem);
}

.n-table {
  width: 100%;
  border-collapse: collapse;
  font-family: var(--font-fontFamily-sans, sans-serif);
  font-size: var(--font-fontSize-base, 1rem);
  color: var(--color-neutral-800, #262626);
}

.n-table__head {
  background-color: var(--color-neutral-50, #fafafa);
  border-bottom: var(--borderWidth-1, 1px) solid var(--color-neutral-200, #e5e5e5);
}

.n-table__th {
  padding: var(--spacing-3, 0.75rem) var(--spacing-4, 1rem);
  font-size: var(--font-fontSize-sm, 0.875rem);
  font-weight: var(--font-fontWeight-semibold, 600);
  color: var(--color-neutral-600, #525252);
  text-transform: none;
  white-space: nowrap;
}

.n-table__td {
  padding: var(--spacing-3, 0.75rem) var(--spacing-4, 1rem);
  border-bottom: var(--borderWidth-1, 1px) solid var(--color-neutral-100, #f5f5f5);
}

.n-table__row:last-child .n-table__td {
  border-bottom: none;
}

/* --- Compact --- */
.n-table--compact .n-table__th {
  padding: var(--spacing-2, 0.5rem) var(--spacing-3, 0.75rem);
  font-size: var(--font-fontSize-xs, 0.75rem);
}

.n-table--compact .n-table__td {
  padding: var(--spacing-2, 0.5rem) var(--spacing-3, 0.75rem);
  font-size: var(--font-fontSize-sm, 0.875rem);
}

/* --- Striped --- */
.n-table--striped .n-table__body .n-table__row:nth-child(even) {
  background-color: var(--color-neutral-50, #fafafa);
}

/* --- Hoverable --- */
.n-table--hoverable .n-table__body .n-table__row {
  transition: background-color var(--transition-fast, 150ms ease);
}

.n-table--hoverable .n-table__body .n-table__row:hover {
  background-color: var(--color-primary-50, #eff6ff);
}
</style>
