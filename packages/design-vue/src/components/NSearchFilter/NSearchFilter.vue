<template>
  <div class="n-search-filter">
    <!-- Search input -->
    <div v-if="searchable" class="n-search-filter__search">
      <svg class="n-search-filter__search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.5" />
        <path d="M11 11l3.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      </svg>
      <input
        type="text"
        class="n-search-filter__input"
        :placeholder="searchPlaceholder"
        :value="searchValue"
        @input="onSearchInput"
      />
      <button
        v-if="searchValue"
        class="n-search-filter__clear"
        aria-label="Clear search"
        @click="$emit('update:searchValue', '')"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M10.5 3.5L3.5 10.5M3.5 3.5l7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      </button>
    </div>

    <!-- Filter selects -->
    <div v-for="filter in filters" :key="filter.key" class="n-search-filter__select-wrap">
      <select
        class="n-search-filter__select"
        :value="filterValues[filter.key] ?? ''"
        @change="onFilterChange(filter.key, ($event.target as HTMLSelectElement).value)"
      >
        <option value="">{{ filter.label }}</option>
        <option v-for="opt in filter.options" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
      <svg class="n-search-filter__select-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M3 4.5l3 3 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </div>

    <!-- Date range -->
    <template v-if="dateRange">
      <div class="n-search-filter__date-wrap">
        <input
          type="date"
          class="n-search-filter__date"
          :value="dateRangeValue?.start ?? ''"
          @change="onDateStartChange"
        />
        <span class="n-search-filter__date-separator">~</span>
        <input
          type="date"
          class="n-search-filter__date"
          :value="dateRangeValue?.end ?? ''"
          @change="onDateEndChange"
        />
      </div>
    </template>

    <!-- Reset -->
    <button v-if="hasActiveFilters" class="n-search-filter__reset" @click="$emit('reset')">
      Reset
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface NFilterOption {
  label: string
  value: string
}

export interface NFilterConfig {
  key: string
  label: string
  options: NFilterOption[]
}

export interface NDateRangeValue {
  start: string
  end: string
}

export interface NSearchFilterProps {
  searchable?: boolean
  searchValue?: string
  searchPlaceholder?: string
  filters?: NFilterConfig[]
  filterValues?: Record<string, string>
  dateRange?: boolean
  dateRangeValue?: NDateRangeValue
}

const props = withDefaults(defineProps<NSearchFilterProps>(), {
  searchable: true,
  searchValue: '',
  searchPlaceholder: 'Search...',
  filters: () => [],
  filterValues: () => ({}),
  dateRange: false,
  dateRangeValue: undefined,
})

const emit = defineEmits<{
  'update:searchValue': [value: string]
  'update:filterValues': [values: Record<string, string>]
  'update:dateRangeValue': [value: NDateRangeValue]
  reset: []
}>()

const hasActiveFilters = computed(() => {
  if (props.searchValue) return true
  if (Object.values(props.filterValues).some((v) => v)) return true
  if (props.dateRangeValue?.start || props.dateRangeValue?.end) return true
  return false
})

function onSearchInput(event: Event) {
  emit('update:searchValue', (event.target as HTMLInputElement).value)
}

function onFilterChange(key: string, value: string) {
  emit('update:filterValues', { ...props.filterValues, [key]: value })
}

function onDateStartChange(event: Event) {
  const start = (event.target as HTMLInputElement).value
  emit('update:dateRangeValue', { start, end: props.dateRangeValue?.end ?? '' })
}

function onDateEndChange(event: Event) {
  const end = (event.target as HTMLInputElement).value
  emit('update:dateRangeValue', { start: props.dateRangeValue?.start ?? '', end })
}
</script>

<style scoped>
.n-search-filter {
  display: flex;
  align-items: center;
  gap: var(--spacing-3, 0.75rem);
  flex-wrap: wrap;
  font-family: var(--font-fontFamily-sans, sans-serif);
}

.n-search-filter__search {
  display: flex;
  align-items: center;
  position: relative;
  flex: 1;
  min-width: 200px;
  max-width: 320px;
}

.n-search-filter__search-icon {
  position: absolute;
  left: 10px;
  color: var(--color-neutral-400, #a3a3a3);
  pointer-events: none;
}

.n-search-filter__input {
  width: 100%;
  padding: var(--spacing-2, 0.5rem) var(--spacing-3, 0.75rem) var(--spacing-2, 0.5rem) 34px;
  border: var(--borderWidth-1, 1px) solid var(--color-neutral-300, #d4d4d4);
  border-radius: var(--radius-md, 0.375rem);
  font-size: var(--font-fontSize-sm, 0.875rem);
  font-family: inherit;
  background-color: var(--color-neutral-0, #ffffff);
  color: var(--color-neutral-800, #262626);
  outline: none;
  transition: border-color 150ms ease;
}

.n-search-filter__input:focus {
  border-color: var(--color-primary-500, #6239FF);
  box-shadow: 0 0 0 2px var(--color-primary-200, #ddd6fe);
}

.n-search-filter__input::placeholder {
  color: var(--color-neutral-400, #a3a3a3);
}

.n-search-filter__clear {
  position: absolute;
  right: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: var(--color-neutral-400, #a3a3a3);
  cursor: pointer;
  border-radius: var(--radius-sm, 0.25rem);
}

.n-search-filter__clear:hover {
  color: var(--color-neutral-600, #525252);
}

.n-search-filter__select-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.n-search-filter__select {
  appearance: none;
  padding: var(--spacing-2, 0.5rem) var(--spacing-8, 2rem) var(--spacing-2, 0.5rem) var(--spacing-3, 0.75rem);
  border: var(--borderWidth-1, 1px) solid var(--color-neutral-300, #d4d4d4);
  border-radius: var(--radius-md, 0.375rem);
  font-size: var(--font-fontSize-sm, 0.875rem);
  font-family: inherit;
  background-color: var(--color-neutral-0, #ffffff);
  color: var(--color-neutral-700, #404040);
  cursor: pointer;
  outline: none;
}

.n-search-filter__select:focus {
  border-color: var(--color-primary-500, #6239FF);
}

.n-search-filter__select-arrow {
  position: absolute;
  right: 8px;
  pointer-events: none;
  color: var(--color-neutral-400, #a3a3a3);
}

.n-search-filter__date-wrap {
  display: flex;
  align-items: center;
  gap: var(--spacing-2, 0.5rem);
}

.n-search-filter__date {
  padding: var(--spacing-2, 0.5rem) var(--spacing-3, 0.75rem);
  border: var(--borderWidth-1, 1px) solid var(--color-neutral-300, #d4d4d4);
  border-radius: var(--radius-md, 0.375rem);
  font-size: var(--font-fontSize-sm, 0.875rem);
  font-family: inherit;
  background-color: var(--color-neutral-0, #ffffff);
  color: var(--color-neutral-700, #404040);
  outline: none;
}

.n-search-filter__date:focus {
  border-color: var(--color-primary-500, #6239FF);
}

.n-search-filter__date-separator {
  color: var(--color-neutral-400, #a3a3a3);
  font-size: var(--font-fontSize-sm, 0.875rem);
}

.n-search-filter__reset {
  padding: var(--spacing-2, 0.5rem) var(--spacing-3, 0.75rem);
  border: var(--borderWidth-1, 1px) solid var(--color-neutral-300, #d4d4d4);
  border-radius: var(--radius-md, 0.375rem);
  font-size: var(--font-fontSize-sm, 0.875rem);
  font-family: inherit;
  background-color: var(--color-neutral-0, #ffffff);
  color: var(--color-neutral-600, #525252);
  cursor: pointer;
  transition: all 150ms ease;
}

.n-search-filter__reset:hover {
  background-color: var(--color-neutral-100, #f5f5f5);
  border-color: var(--color-neutral-400, #a3a3a3);
}
</style>
