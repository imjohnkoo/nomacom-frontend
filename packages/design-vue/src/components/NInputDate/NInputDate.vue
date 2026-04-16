<template>
  <DatePickerRoot
    v-model="dateValue"
    class="n-input-date"
  >
    <div class="n-input-date__control">
      <DatePickerField v-slot="{ segments }" class="n-input-date__field">
        <template v-for="segment in segments" :key="segment.part">
          <DatePickerInput
            v-if="segment.part !== 'literal'"
            :part="segment.part"
            class="n-input-date__segment"
          />
          <span v-else class="n-input-date__literal">{{ segment.value }}</span>
        </template>
      </DatePickerField>
      <DatePickerTrigger class="n-input-date__trigger" :disabled="disabled">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" stroke-width="1.5" />
          <path d="M2 6.5H14" stroke="currentColor" stroke-width="1.5" />
          <path d="M5.5 1.5V4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          <path d="M10.5 1.5V4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      </DatePickerTrigger>
    </div>

    <DatePickerContent class="n-input-date__content" :side-offset="4">
      <DatePickerCalendar>
        <template #default="{ grid, weekDays }">
          <DatePickerHeader class="n-input-date__calendar-header">
            <DatePickerPrev class="n-input-date__nav-btn">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8L10 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </DatePickerPrev>
            <DatePickerHeading class="n-input-date__heading" />
            <DatePickerNext class="n-input-date__nav-btn">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 4L10 8L6 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </DatePickerNext>
          </DatePickerHeader>

          <DatePickerGrid
            v-for="month in grid"
            :key="month.value.toString()"
            class="n-input-date__grid"
          >
            <DatePickerGridHead>
              <DatePickerGridRow class="n-input-date__grid-row">
                <DatePickerHeadCell
                  v-for="day in weekDays"
                  :key="day"
                  class="n-input-date__head-cell"
                >
                  {{ day }}
                </DatePickerHeadCell>
              </DatePickerGridRow>
            </DatePickerGridHead>
            <DatePickerGridBody>
              <DatePickerGridRow
                v-for="(week, index) in month.rows"
                :key="`week-${index}`"
                class="n-input-date__grid-row"
              >
                <DatePickerCell
                  v-for="day in week"
                  :key="day.toString()"
                  :date="day"
                  class="n-input-date__cell"
                >
                  <DatePickerCellTrigger
                    :day="day"
                    :month="month.value"
                    class="n-input-date__cell-trigger"
                  />
                </DatePickerCell>
              </DatePickerGridRow>
            </DatePickerGridBody>
          </DatePickerGrid>
        </template>
      </DatePickerCalendar>
    </DatePickerContent>
  </DatePickerRoot>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  DatePickerRoot,
  DatePickerField,
  DatePickerInput,
  DatePickerTrigger,
  DatePickerContent,
  DatePickerCalendar,
  DatePickerHeader,
  DatePickerHeading,
  DatePickerGrid,
  DatePickerGridHead,
  DatePickerGridBody,
  DatePickerGridRow,
  DatePickerHeadCell,
  DatePickerCell,
  DatePickerCellTrigger,
  DatePickerPrev,
  DatePickerNext,
} from 'reka-ui'
import {
  CalendarDate,
  type DateValue,
} from '@internationalized/date'

export interface NInputDateProps {
  modelValue?: string
  placeholder?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<NInputDateProps>(), {
  modelValue: undefined,
  placeholder: 'Select date',
  disabled: false,
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

<style>
.n-input-date {
  position: relative;
  font-family: var(--font-fontFamily-sans, sans-serif);
  width: 100%;
}

.n-input-date__control {
  display: flex;
  align-items: center;
  border: var(--borderWidth-1, 1px) solid var(--color-neutral-300, #d4d4d4);
  border-radius: var(--radius-md, 0.375rem);
  background-color: var(--color-neutral-0, #ffffff);
  transition: border-color var(--transition-fast, 150ms ease);
}

.n-input-date__control:focus-within {
  border-color: var(--color-primary-500, #3b82f6);
  box-shadow: 0 0 0 2px var(--color-primary-100, #dbeafe);
}

.n-input-date__field {
  display: flex;
  align-items: center;
  flex: 1;
  padding: var(--spacing-2, 0.5rem) var(--spacing-3, 0.75rem);
  gap: var(--spacing-1, 0.25rem);
}

.n-input-date__segment {
  font-size: var(--font-fontSize-base, 1rem);
  color: var(--color-neutral-800, #262626);
  padding: 1px 2px;
  border-radius: var(--radius-sm, 0.25rem);
  outline: none;
}

.n-input-date__segment:focus {
  background-color: var(--color-primary-100, #dbeafe);
  color: var(--color-primary-800, #1e40af);
}

.n-input-date__segment[data-placeholder] {
  color: var(--color-neutral-400, #a3a3a3);
}

.n-input-date__trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2, 0.5rem);
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--color-neutral-500, #737373);
  transition: color var(--transition-fast, 150ms ease);
}

.n-input-date__trigger:hover {
  color: var(--color-neutral-700, #404040);
}

.n-input-date__trigger:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.n-input-date__content {
  background-color: var(--color-neutral-0, #ffffff);
  border: var(--borderWidth-1, 1px) solid var(--color-neutral-200, #e5e5e5);
  border-radius: var(--radius-lg, 0.5rem);
  box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
  padding: var(--spacing-3, 0.75rem);
  z-index: 50;
}

.n-input-date__calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: var(--spacing-3, 0.75rem);
}

.n-input-date__heading {
  font-size: var(--font-fontSize-base, 1rem);
  font-weight: var(--font-fontWeight-semibold, 600);
  color: var(--color-neutral-800, #262626);
}

.n-input-date__nav-btn {
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

.n-input-date__nav-btn:hover {
  background-color: var(--color-neutral-100, #f5f5f5);
}

.n-input-date__grid {
  width: 100%;
}

.n-input-date__grid-row {
  display: flex;
}

.n-input-date__head-cell {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-fontSize-xs, 0.75rem);
  font-weight: var(--font-fontWeight-medium, 500);
  color: var(--color-neutral-500, #737373);
}

.n-input-date__cell {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1px;
}

.n-input-date__cell-trigger {
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

.n-input-date__cell-trigger:hover {
  background-color: var(--color-neutral-100, #f5f5f5);
}

.n-input-date__cell-trigger:focus-visible {
  outline: 2px solid var(--color-primary-500, #3b82f6);
  outline-offset: -2px;
}

.n-input-date__cell-trigger[data-selected] {
  background-color: var(--color-primary-600, #2563eb);
  color: var(--color-neutral-0, #ffffff);
  font-weight: var(--font-fontWeight-medium, 500);
}

.n-input-date__cell-trigger[data-today] {
  font-weight: var(--font-fontWeight-bold, 700);
  color: var(--color-primary-600, #2563eb);
}

.n-input-date__cell-trigger[data-today][data-selected] {
  color: var(--color-neutral-0, #ffffff);
}

.n-input-date__cell-trigger[data-disabled] {
  opacity: 0.3;
  cursor: not-allowed;
}

.n-input-date__cell-trigger[data-outside-month] {
  color: var(--color-neutral-300, #d4d4d4);
}
</style>
