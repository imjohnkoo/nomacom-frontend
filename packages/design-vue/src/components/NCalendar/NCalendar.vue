<template>
  <CalendarRoot
    v-model="dateValue"
    :locale="locale"
    class="n-calendar"
    weekday-format="short"
  >
    <template #default="{ grid, weekDays }">
      <CalendarHeader class="n-calendar__header">
        <CalendarPrev class="n-calendar__nav-btn">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M10 12L6 8L10 4"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </CalendarPrev>
        <CalendarHeading class="n-calendar__heading" />
        <CalendarNext class="n-calendar__nav-btn">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M6 4L10 8L6 12"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </CalendarNext>
      </CalendarHeader>

      <CalendarGrid
        v-for="month in grid"
        :key="month.value.toString()"
        class="n-calendar__grid"
      >
        <CalendarGridHead class="n-calendar__grid-head">
          <CalendarGridRow class="n-calendar__grid-row">
            <CalendarHeadCell
              v-for="day in weekDays"
              :key="day"
              class="n-calendar__head-cell"
            >
              {{ day }}
            </CalendarHeadCell>
          </CalendarGridRow>
        </CalendarGridHead>
        <CalendarGridBody>
          <CalendarGridRow
            v-for="(week, weekIndex) in month.rows"
            :key="`week-${weekIndex}`"
            class="n-calendar__grid-row"
          >
            <CalendarCell
              v-for="day in week"
              :key="day.toString()"
              :date="day"
              class="n-calendar__cell"
            >
              <CalendarCellTrigger
                :day="day"
                :month="month.value"
                class="n-calendar__cell-trigger"
              />
            </CalendarCell>
          </CalendarGridRow>
        </CalendarGridBody>
      </CalendarGrid>
    </template>
  </CalendarRoot>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  CalendarRoot,
  CalendarHeader,
  CalendarHeading,
  CalendarGrid,
  CalendarGridHead,
  CalendarGridBody,
  CalendarGridRow,
  CalendarHeadCell,
  CalendarCell,
  CalendarCellTrigger,
  CalendarPrev,
  CalendarNext,
} from 'reka-ui'
import {
  CalendarDate,
  type DateValue,
} from '@internationalized/date'

export interface NCalendarProps {
  modelValue?: string
  locale?: string
}

const props = withDefaults(defineProps<NCalendarProps>(), {
  modelValue: undefined,
  locale: 'ko-KR',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const dateValue = computed({
  get: () => {
    if (!props.modelValue) return undefined
    const [y, m, d] = props.modelValue.split('-').map(Number)
    return new CalendarDate(y, m, d)
  },
  set: (val: DateValue | undefined) => {
    if (val) {
      emit('update:modelValue', val.toString())
    }
  },
})
</script>

<style scoped>
.n-calendar {
  font-family: var(--font-fontFamily-sans, sans-serif);
  padding: var(--spacing-3, 0.75rem);
  background-color: var(--color-neutral-0, #ffffff);
  border: var(--borderWidth-1, 1px) solid var(--color-neutral-200, #e5e5e5);
  border-radius: var(--radius-lg, 0.5rem);
  width: fit-content;
}

.n-calendar__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: var(--spacing-3, 0.75rem);
}

.n-calendar__heading {
  font-size: var(--font-fontSize-base, 1rem);
  font-weight: var(--font-fontWeight-semibold, 600);
  color: var(--color-neutral-800, #262626);
}

.n-calendar__nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: var(--radius-md, 0.375rem);
  cursor: pointer;
  color: var(--color-neutral-600, #525252);
  transition: background-color var(--transition-fast, 150ms ease);
}

.n-calendar__nav-btn:hover {
  background-color: var(--color-neutral-100, #f5f5f5);
}

.n-calendar__nav-btn:focus-visible {
  outline: 2px solid var(--color-primary-500, #3b82f6);
  outline-offset: -2px;
}

.n-calendar__grid {
  width: 100%;
  border-collapse: collapse;
}

.n-calendar__grid-head {
  color: var(--color-neutral-500, #737373);
}

.n-calendar__grid-row {
  display: flex;
}

.n-calendar__head-cell {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-fontSize-xs, 0.75rem);
  font-weight: var(--font-fontWeight-medium, 500);
  color: var(--color-neutral-500, #737373);
}

.n-calendar__cell {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1px;
}

.n-calendar__cell-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: var(--radius-full, 9999px);
  font-size: var(--font-fontSize-sm, 0.875rem);
  color: var(--color-neutral-800, #262626);
  cursor: pointer;
  transition: all var(--transition-fast, 150ms ease);
}

.n-calendar__cell-trigger:hover {
  background-color: var(--color-neutral-100, #f5f5f5);
}

.n-calendar__cell-trigger:focus-visible {
  outline: 2px solid var(--color-primary-500, #3b82f6);
  outline-offset: -2px;
}

.n-calendar__cell-trigger[data-selected] {
  background-color: var(--color-primary-600, #2563eb);
  color: var(--color-neutral-0, #ffffff);
  font-weight: var(--font-fontWeight-medium, 500);
}

.n-calendar__cell-trigger[data-today] {
  font-weight: var(--font-fontWeight-bold, 700);
  color: var(--color-primary-600, #2563eb);
}

.n-calendar__cell-trigger[data-today][data-selected] {
  color: var(--color-neutral-0, #ffffff);
}

.n-calendar__cell-trigger[data-disabled] {
  opacity: 0.3;
  cursor: not-allowed;
}

.n-calendar__cell-trigger[data-outside-month] {
  color: var(--color-neutral-300, #d4d4d4);
}

.n-calendar__cell-trigger[data-unavailable] {
  text-decoration: line-through;
  opacity: 0.3;
}
</style>
