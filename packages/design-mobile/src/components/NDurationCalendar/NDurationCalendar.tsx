import React, { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, type TextStyle, type ViewStyle } from 'react-native'
import { theme } from '../../theme'

export interface CalDate {
  year: number
  month: number
  day: number
}

export interface NDurationCalendarProps {
  value?: CalDate | null
  onChange?: (value: CalDate) => void
  /** 시작일 선택 시 duration 일 뒤까지 range 하이라이트 */
  duration?: number
  today?: CalDate
  minDate?: CalDate
}

const DOW = ['일', '월', '화', '수', '목', '금', '토']

function fallbackToday(): CalDate {
  const d = new Date()
  return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() }
}
const toDate = (c: CalDate) => new Date(c.year, c.month - 1, c.day)
const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

interface Cell {
  key: string
  day: number
  year: number
  month: number
  dim: boolean
  disabled: boolean
  isToday: boolean
  isStart: boolean
  isEnd: boolean
  inRange: boolean
}

/**
 * 시작일 선택 + duration 자동 range 캘린더 — design-vue NDurationCalendar 의 RN 포팅.
 * 과거 (minDate 이전) disable, 이전월 spillover 는 dim 처리.
 */
export function NDurationCalendar({
  value = null,
  onChange,
  duration = 0,
  today,
  minDate,
}: NDurationCalendarProps) {
  const todayC = today ?? fallbackToday()
  const minC = minDate ?? todayC

  const initial = value ?? todayC
  const [view, setView] = useState<{ year: number; month: number }>({
    year: initial.year,
    month: initial.month,
  })

  useEffect(() => {
    if (value && (value.year !== view.year || value.month !== view.month)) {
      setView({ year: value.year, month: value.month })
    }
    // 외부에서 value 가 다른 달로 바뀔 때만 view 를 따라감
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.year, value?.month])

  const { year: y, month: m } = view
  const firstDow = new Date(y, m - 1, 1).getDay()
  const daysInMonth = new Date(y, m, 0).getDate()
  const prevDays = new Date(y, m - 1, 0).getDate()

  const selectedDate = value ? toDate(value) : null
  const endDate = selectedDate ? new Date(selectedDate) : null
  if (endDate && duration > 0) endDate.setDate(endDate.getDate() + duration)
  const todayD = toDate(todayC)
  const minD = toDate(minC)

  const cells: Cell[] = []
  const push = (year: number, month: number, day: number, dim: boolean) => {
    const cellDate = new Date(year, month - 1, day)
    const before = cellDate < minD
    cells.push({
      key: `${year}-${month}-${day}`,
      day,
      year,
      month,
      dim,
      disabled: dim || before,
      isToday: !dim && sameDay(cellDate, todayD),
      isStart: !!selectedDate && sameDay(cellDate, selectedDate),
      isEnd: !!endDate && sameDay(cellDate, endDate),
      inRange: !!selectedDate && !!endDate && cellDate >= selectedDate && cellDate <= endDate,
    })
  }

  for (let i = 0; i < firstDow; i++) {
    const d = prevDays - (firstDow - 1 - i)
    push(m === 1 ? y - 1 : y, m === 1 ? 12 : m - 1, d, true)
  }
  for (let d = 1; d <= daysInMonth; d++) push(y, m, d, false)
  let nx = 1
  while ((firstDow + daysInMonth + nx - 1) % 7 !== 0) {
    push(m === 12 ? y + 1 : y, m === 12 ? 1 : m + 1, nx, true)
    nx++
  }

  const canPrev = new Date(y, m - 1, 0) >= minD

  const prevMonth = () =>
    setView(({ year, month }) => (month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 }))
  const nextMonth = () =>
    setView(({ year, month }) => (month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 }))

  const cellViewStyle = (c: Cell): ViewStyle[] => {
    const s: ViewStyle[] = [styles.cell]
    if (c.inRange && !c.dim) {
      if (c.isStart) s.push(styles.cellStart)
      else if (c.isEnd) s.push(styles.cellEnd)
      else s.push(styles.cellRange)
    } else if (c.isToday && !c.isStart) {
      s.push(styles.cellToday)
    }
    return s
  }

  const cellTextStyle = (c: Cell, dowIdx: number): TextStyle[] => {
    const s: TextStyle[] = [styles.cellText]
    if (c.dim || (c.disabled && !c.isStart)) s.push(styles.cellTextDisabled)
    else if (dowIdx === 0) s.push(styles.cellTextSun)
    else if (dowIdx === 6) s.push(styles.cellTextSat)
    if (c.isStart && !c.dim) s.push(styles.cellTextStart)
    else if ((c.inRange || c.isEnd) && !c.dim) s.push(styles.cellTextRange)
    return s
  }

  return (
    <View>
      <View style={styles.head}>
        <TouchableOpacity
          style={[styles.nav, !canPrev && styles.navDisabled]}
          onPress={prevMonth}
          disabled={!canPrev}
          accessibilityLabel="이전 달"
        >
          <Text style={styles.navGlyph}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>
          {y}년 {m}월
        </Text>
        <TouchableOpacity style={styles.nav} onPress={nextMonth} accessibilityLabel="다음 달">
          <Text style={styles.navGlyph}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.week}>
        {DOW.map((d, i) => (
          <Text
            key={d}
            style={[styles.wday, i === 0 && styles.cellTextSun, i === 6 && styles.cellTextSat]}
          >
            {d}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((c, i) => (
          <TouchableOpacity
            key={c.key}
            style={styles.cellWrap}
            disabled={c.disabled}
            onPress={() => onChange?.({ year: c.year, month: c.month, day: c.day })}
            activeOpacity={0.6}
          >
            <View style={cellViewStyle(c)}>
              <Text style={cellTextStyle(c, i % 7)}>{c.day}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

const CELL = 38

const styles = StyleSheet.create({
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: theme.fontSize.base,
    fontWeight: '700',
    color: theme.colors.neutral[900],
  },
  nav: {
    width: 34,
    height: 34,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.neutral[50],
  },
  navDisabled: {
    opacity: 0.35,
  },
  navGlyph: {
    fontSize: 20,
    lineHeight: 22,
    color: theme.colors.neutral[600],
  },
  week: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  wday: {
    flex: 1,
    textAlign: 'center',
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.neutral[400],
    paddingVertical: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cellWrap: {
    width: '14.2857%',
    alignItems: 'center',
    paddingVertical: 2,
  },
  cell: {
    width: CELL,
    height: CELL,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellToday: {
    borderWidth: 1.5,
    borderColor: theme.colors.primary[300],
  },
  cellStart: {
    backgroundColor: theme.colors.primary[500],
  },
  cellEnd: {
    backgroundColor: theme.colors.primary[100],
  },
  cellRange: {
    backgroundColor: theme.colors.primary[50],
  },
  cellText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
    color: theme.colors.neutral[800],
  },
  cellTextDisabled: {
    color: theme.colors.neutral[300],
  },
  cellTextSun: {
    color: theme.colors.error[500],
  },
  cellTextSat: {
    color: theme.colors.info[500],
  },
  cellTextStart: {
    color: theme.colors.white,
    fontWeight: '700',
  },
  cellTextRange: {
    color: theme.colors.primary[700],
    fontWeight: '600',
  },
})
