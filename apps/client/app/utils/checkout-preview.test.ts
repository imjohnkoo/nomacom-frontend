import { describe, expect, it } from 'vitest'
import {
  PAYMENT_ID_PATTERN,
  PREVIEW_ITEM,
  PREVIEW_ORDER_NAME,
  createPaymentId,
  formatWon,
  readPaymentResult,
} from './checkout-preview'

describe('createPaymentId', () => {
  it('pv-{ms}-{hex24} · 토스 규칙(6~64자 · [A-Za-z0-9_-]) 안', () => {
    const id = createPaymentId(1790105212345, new Uint8Array(12).fill(171))
    expect(id).toBe('pv-1790105212345-abababababababababababab')
    expect(id).toMatch(PAYMENT_ID_PATTERN)
    expect(id.length).toBeLessThanOrEqual(64)
  })

  it('바이트가 달라지면 ID 가 달라진다', () => {
    const a = createPaymentId(1, new Uint8Array([0, 1, 2]))
    const b = createPaymentId(1, new Uint8Array([0, 1, 3]))
    expect(a).not.toBe(b)
    expect(a).toBe('pv-1-000102')
  })
})

describe('상품 값 (PG 심사 요건)', () => {
  it('상품명에 TEST 가 없고 금액은 양수 · 주문명 100자 이하', () => {
    expect(`${PREVIEW_ITEM.productName} ${PREVIEW_ORDER_NAME}`.toUpperCase()).not.toContain('TEST')
    expect(PREVIEW_ITEM.amount).toBeGreaterThan(0)
    expect(PREVIEW_ORDER_NAME.length).toBeLessThanOrEqual(100)
  })

  it('사용 기간 카피는 «첫 연결부터 24시간 단위» (eSIM 카피 불변식)', () => {
    expect(PREVIEW_ITEM.usage).toContain('처음 연결한 때부터 24시간 단위')
    expect(PREVIEW_ITEM.usage).not.toContain('자정')
  })

  it('원 표기', () => {
    expect(formatWon(4900)).toBe('4,900원')
  })
})

describe('readPaymentResult', () => {
  it('쿼리가 없으면 none', () => {
    expect(readPaymentResult({})).toEqual({ status: 'none' })
    expect(readPaymentResult({ code: 'X' })).toEqual({ status: 'none' })
  })

  it('code 없음 → success', () => {
    expect(readPaymentResult({ paymentId: 'pv-1-00' })).toEqual({
      status: 'success',
      paymentId: 'pv-1-00',
    })
  })

  it('code 있음 → failed · message 우선, 없으면 pgMessage, 그것도 없으면 code', () => {
    expect(
      readPaymentResult({
        paymentId: 'pv-1-00',
        code: 'FAILURE_TYPE_PG',
        message: '사용자가 결제를 취소했습니다',
      }),
    ).toEqual({ status: 'failed', paymentId: 'pv-1-00', message: '사용자가 결제를 취소했습니다' })
    expect(
      readPaymentResult({ paymentId: 'pv-1-00', code: 'X', pgMessage: 'PG 사유' }),
    ).toMatchObject({
      message: 'PG 사유',
    })
    expect(readPaymentResult({ paymentId: 'pv-1-00', code: 'X' })).toMatchObject({ message: 'X' })
  })

  it('배열 쿼리는 첫 값', () => {
    expect(readPaymentResult({ paymentId: ['pv-1-00', 'pv-2-00'] })).toEqual({
      status: 'success',
      paymentId: 'pv-1-00',
    })
  })
})
