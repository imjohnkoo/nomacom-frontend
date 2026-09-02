/**
 * 날짜 유틸 — client `app/utils/date.ts` 의 mobile 필요분 포팅 + CalDate 헬퍼.
 * date-fns 미도입 (addDays + yyyy-MM-dd 포맷 2개뿐이라 handroll).
 */
import type { CalDate } from '@imjohnkoo/design-mobile'

const DOW_KR = ['일', '월', '화', '수', '목', '금', '토']

export function calDateToDate(c: CalDate): Date {
  return new Date(c.year, c.month - 1, c.day)
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

/** yyyy-MM-dd (API startDate/endDate 포맷) */
export function toIsoDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** yyyy.MM.dd (요일) — 화면 표기 */
export function formatDateLabel(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}.${m}.${d} (${DOW_KR[date.getDay()]})`
}

/** 2024년 1월 15일 — 주문일 표기 (client formatDateString 동일) */
export function formatDateString(date: Date | string): string {
  const dateObj = new Date(date)
  return `${dateObj.getFullYear()}년 ${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일`
}
