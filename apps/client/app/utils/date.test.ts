import { afterEach, describe, expect, it } from 'vitest'
import { formatDateString } from './date'

// 실행 머신 시간대와 무관해야 한다 — KST 개발 머신에서도 회귀(로컬 시간대 사용)를 잡도록 시간대를 바꿔 가며 본다
const ORIGINAL_TZ = process.env.TZ
afterEach(() => {
  process.env.TZ = ORIGINAL_TZ
})

describe.each(['UTC', 'America/Los_Angeles', 'Asia/Seoul'])(
  'formatDateString — 한국 시간 고정 (실행 시간대 %s)',
  (tz) => {
    it('UTC 15:00 이후는 한국 날짜로 다음 날', () => {
      process.env.TZ = tz
      expect(formatDateString('2026-09-22T15:30:00.000Z')).toBe('2026년 9월 23일')
      expect(formatDateString('2026-09-22T14:59:59.000Z')).toBe('2026년 9월 22일')
      expect(formatDateString('2026-09-23T08:00:00.000Z')).toBe('2026년 9월 23일')
    })

    it('Date 객체도 같은 규칙', () => {
      process.env.TZ = tz
      expect(formatDateString(new Date('2026-12-31T16:00:00.000Z'))).toBe('2027년 1월 1일')
    })
  },
)

describe('formatDateString — 해석할 수 없는 값', () => {
  it('예외 대신 빈 글자 (SSR 500 방지)', () => {
    expect(formatDateString('garbage')).toBe('')
    expect(formatDateString(new Date(Number.NaN))).toBe('')
  })
})
