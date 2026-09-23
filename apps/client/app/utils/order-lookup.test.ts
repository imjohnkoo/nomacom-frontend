import { describe, expect, it } from 'vitest'
import {
  ORDER_LOOKUP_MESSAGES,
  buildGuestVerifyUrl,
  normalizeOrderInput,
  validateOrderNumber,
} from './order-lookup'

describe('normalizeOrderInput', () => {
  it('공백 · 하이픈을 지운다', () => {
    expect(normalizeOrderInput(' 2026 0923-1234 5678 ')).toBe('2026092312345678')
  })
})

describe('validateOrderNumber', () => {
  it.each([
    ['', 'empty'],
    ['   ', 'empty'],
    ['12ab', 'not-digits'],
    ['2026-09-23-가나', 'not-digits'],
    ['123', 'length'],
    ['123456789', 'length'],
    ['12345678901234567', 'length'],
    ['9999999999999999', 'length'],
    ['0012345678', 'length'],
    ['0000000000', 'length'],
  ] as const)('%j → %s', (raw, error) => {
    expect(validateOrderNumber(raw)).toEqual({ ok: false, error })
  })

  it.each([
    ['2026092312345678', '2026092312345678'],
    ['2026 0923-1234 5678', '2026092312345678'],
    ['1234567890', '1234567890'],
  ])('%j → 통과', (raw, orderId) => {
    expect(validateOrderNumber(raw)).toEqual({ ok: true, orderId })
  })

  it('오류마다 문구가 있다', () => {
    expect(ORDER_LOOKUP_MESSAGES.empty).toBe('주문번호를 입력해 주세요.')
    expect(ORDER_LOOKUP_MESSAGES['not-digits']).toBe('주문번호는 숫자만 입력해 주세요.')
    expect(ORDER_LOOKUP_MESSAGES.length).toBe('주문번호 자릿수를 다시 확인해 주세요.')
  })
})

describe('buildGuestVerifyUrl', () => {
  it('발급 호스트의 /verify/{주문번호} (K3)', () => {
    expect(buildGuestVerifyUrl('https://app.esimmany.com', '2026092312345678')).toBe(
      'https://app.esimmany.com/verify/2026092312345678',
    )
  })

  it('끝 슬래시를 정리한다 (로컬 override)', () => {
    expect(buildGuestVerifyUrl('http://localhost:3000/', '1234567890')).toBe(
      'http://localhost:3000/verify/1234567890',
    )
  })
})
