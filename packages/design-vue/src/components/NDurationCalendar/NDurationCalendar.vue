<template>
  <div class="n-duration-calendar">
    <header class="n-duration-calendar__head">
      <button
        type="button"
        class="n-duration-calendar__nav"
        :disabled="!canPrev"
        :aria-label="'이전 달'"
        @click="prevMonth"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <div class="n-duration-calendar__title">{{ view.year }}년 {{ view.month }}월</div>
      <button
        type="button"
        class="n-duration-calendar__nav"
        :aria-label="'다음 달'"
        @click="nextMonth"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </header>

    <div class="n-duration-calendar__week">
      <div v-for="(d, i) in dow" :key="i" :class="['n-duration-calendar__wday', dowClass(i)]">
        {{ d }}
      </div>
    </div>

    <div class="n-duration-calendar__grid">
      <button
        v-for="(cell, i) in cells"
        :key="i"
        type="button"
        :class="cell.cls"
        :disabled="cell.disabled"
        @click="cell.clickable ? selectDay(cell.year, cell.month, cell.day) : null"
      >
        {{ cell.day }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'

export interface CalDate {
  year: number
  month: number
  day: number
}

export interface NDurationCalendarProps {
  modelValue?: CalDate | null
  duration?: number
  today?: CalDate
  minDate?: CalDate
}

const props = withDefaults(defineProps<NDurationCalendarProps>(), {
  modelValue: null,
  duration: 0,
  today: undefined,
  minDate: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: CalDate]
}>()

const dow = ['일', '월', '화', '수', '목', '금', '토']
const dowClass = (i: number) => {
  if (i === 0) return 'n-duration-calendar__wday--sun'
  if (i === 6) return 'n-duration-calendar__wday--sat'
  return ''
}

function fallbackToday(): CalDate {
  const d = new Date()
  return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() }
}
const todayRef = computed<CalDate>(() => props.today ?? fallbackToday())
const minDate = computed<CalDate>(() => props.minDate ?? todayRef.value)
const toDate = (c: CalDate) => new Date(c.year, c.month - 1, c.day)
const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

const initialView = computed<CalDate>(() => {
  const m = props.modelValue ?? todayRef.value
  return { year: m.year, month: m.month, day: 1 }
})

const view = ref<CalDate>({ ...initialView.value })

watchEffect(() => {
  // when modelValue changes outside, follow the view if the month is different
  if (
    props.modelValue &&
    (props.modelValue.year !== view.value.year || props.modelValue.month !== view.value.month)
  ) {
    view.value = { year: props.modelValue.year, month: props.modelValue.month, day: 1 }
  }
})

const cells = computed(() => {
  const y = view.value.year
  const m = view.value.month
  const firstDow = new Date(y, m - 1, 1).getDay()
  const daysInMonth = new Date(y, m, 0).getDate()
  const prevDays = new Date(y, m - 1, 0).getDate()
  const selectedDate = props.modelValue ? toDate(props.modelValue) : null
  const endDate = selectedDate ? new Date(selectedDate) : null
  if (endDate && props.duration > 0) endDate.setDate(endDate.getDate() + props.duration)
  const today = toDate(todayRef.value)
  const minD = toDate(minDate.value)

  function classFor(cellDate: Date, dim: boolean) {
    const before = cellDate < minD
    const isToday = sameDay(cellDate, today)
    const isStart = selectedDate && sameDay(cellDate, selectedDate)
    const isEnd = endDate && sameDay(cellDate, endDate)
    const inRange = selectedDate && endDate && cellDate >= selectedDate && cellDate <= endDate

    const parts: string[] = ['n-duration-calendar__cell']
    if (dim) parts.push('n-duration-calendar__cell--dim')
    if (!dim && before && !isStart) parts.push('n-duration-calendar__cell--disabled')
    if (!dim && isToday && !isStart) parts.push('n-duration-calendar__cell--today')
    if (inRange) {
      if (isStart)
        parts.push('n-duration-calendar__cell--selected', 'n-duration-calendar__cell--range-start')
      else if (isEnd)
        parts.push('n-duration-calendar__cell--range', 'n-duration-calendar__cell--range-end')
      else parts.push('n-duration-calendar__cell--range')
    }
    return parts.join(' ')
  }

  const list: Array<{
    cls: string
    day: number
    year: number
    month: number
    clickable: boolean
    disabled: boolean
  }> = []

  // previous month leading (dim)
  for (let i = 0; i < firstDow; i++) {
    const d = prevDays - (firstDow - 1 - i)
    const cellDate = new Date(y, m - 2, d)
    list.push({
      cls: classFor(cellDate, true),
      day: d,
      year: m === 1 ? y - 1 : y,
      month: m === 1 ? 12 : m - 1,
      clickable: false,
      disabled: true,
    })
  }
  // current month
  for (let d = 1; d <= daysInMonth; d++) {
    const cellDate = new Date(y, m - 1, d)
    const before = cellDate < minD
    list.push({
      cls: classFor(cellDate, false),
      day: d,
      year: y,
      month: m,
      clickable: !before,
      disabled: before,
    })
  }
  // next month trailing
  let nx = 1
  while ((firstDow + daysInMonth + nx - 1) % 7 !== 0) {
    const cellDate = new Date(y, m, nx)
    list.push({
      cls: classFor(cellDate, true),
      day: nx,
      year: m === 12 ? y + 1 : y,
      month: m === 12 ? 1 : m + 1,
      clickable: false,
      disabled: true,
    })
    nx++
  }
  return list
})

const canPrev = computed(() => {
  const prevLast = new Date(view.value.year, view.value.month - 1, 0)
  return prevLast >= toDate(minDate.value)
})

function selectDay(year: number, month: number, day: number) {
  view.value = { year, month, day: 1 }
  emit('update:modelValue', { year, month, day })
}

function prevMonth() {
  let { year, month } = view.value
  month--
  if (month < 1) {
    month = 12
    year--
  }
  view.value = { year, month, day: 1 }
}

function nextMonth() {
  let { year, month } = view.value
  month++
  if (month > 12) {
    month = 1
    year++
  }
  view.value = { year, month, day: 1 }
}
</script>

<style scoped>
.n-duration-calendar {
  font-family: var(--font-fontFamily-sans, sans-serif);
}

.n-duration-calendar__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.n-duration-calendar__title {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-neutral-900, #171717);
}

.n-duration-calendar__nav {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: var(--radius-full, 9999px);
  background: transparent;
  color: var(--color-neutral-500, #737373);
  cursor: pointer;
  transition:
    background 160ms ease,
    color 160ms ease;
}
.n-duration-calendar__nav:hover:not(:disabled) {
  background: var(--color-neutral-100, #f5f5f5);
  color: var(--color-neutral-900, #171717);
}
.n-duration-calendar__nav:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.n-duration-calendar__week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 8px;
}
.n-duration-calendar__wday {
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-neutral-400, #a3a3a3);
  padding: 4px 0;
}
.n-duration-calendar__wday--sun {
  color: var(--color-error-500, #ef4444);
}
.n-duration-calendar__wday--sat {
  color: var(--color-info-500, #3b82f6);
}

.n-duration-calendar__grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.n-duration-calendar__cell {
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-neutral-900, #171717);
  background: transparent;
  border: 0;
  border-radius: var(--radius-xl, 0.75rem);
  cursor: pointer;
  position: relative;
  transition:
    background 120ms ease,
    color 120ms ease;
}
.n-duration-calendar__cell:hover:not(:disabled) {
  background: var(--color-neutral-100, #f5f5f5);
}
.n-duration-calendar__cell--dim {
  color: var(--color-neutral-300, #d4d4d4);
  cursor: default;
}
.n-duration-calendar__cell--dim:hover {
  background: transparent;
}
.n-duration-calendar__cell--disabled {
  color: var(--color-neutral-300, #d4d4d4);
  cursor: not-allowed;
}
.n-duration-calendar__cell--disabled:hover {
  background: transparent;
}
.n-duration-calendar__cell--today {
  color: var(--color-primary-500, #6239ff);
  font-weight: 700;
}
.n-duration-calendar__cell--today::after {
  content: '';
  position: absolute;
  bottom: 6px;
  width: 4px;
  height: 4px;
  border-radius: var(--radius-full, 9999px);
  background: var(--color-primary-500, #6239ff);
}
.n-duration-calendar__cell--range {
  background: var(--color-primary-50, #f1edff);
  color: var(--color-primary-600, #5025e8);
  border-radius: 0;
}
.n-duration-calendar__cell--range-start {
  border-radius: var(--radius-xl, 0.75rem) 0 0 var(--radius-xl, 0.75rem);
}
.n-duration-calendar__cell--range-end {
  border-radius: 0 var(--radius-xl, 0.75rem) var(--radius-xl, 0.75rem) 0;
}
.n-duration-calendar__cell--selected {
  background: var(--color-primary-500, #6239ff);
  color: var(--color-neutral-0, #ffffff) !important;
  font-weight: 700;
}
.n-duration-calendar__cell--selected.n-duration-calendar__cell--range-start {
  border-radius: var(--radius-xl, 0.75rem);
}
.n-duration-calendar__cell--selected::after {
  background: var(--color-neutral-0, #ffffff);
}
</style>
