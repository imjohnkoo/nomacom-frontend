import { describe, expect, it } from 'vitest'
import { formatDateString } from './date'

describe('formatDateString — 한국 시간 고정 (SSR · 브라우저 같은 글자)', () => {
  it('UTC 15:00 이후는 한국 날짜로 다음 날', () => {
    expect(formatDateString('2026-09-22T15:30:00.000Z')).toBe('2026년 9월 23일')
    expect(formatDateString('2026-09-22T14:59:59.000Z')).toBe('2026년 9월 22일')
  })

  it('Date 객체도 같은 규칙', () => {
    expect(formatDateString(new Date('2026-12-31T16:00:00.000Z'))).toBe('2027년 1월 1일')
  })
})
