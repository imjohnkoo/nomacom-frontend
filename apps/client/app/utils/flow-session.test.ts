import { describe, expect, it } from 'vitest'
import {
  FLOW_COOKIE,
  FLOW_COOKIE_MAX_AGE,
  buildFlowSession,
  flowCookieSize,
  parseFlowSession,
} from './flow-session'

const BASE = { orderId: 2026092312345678, fullName: '홍길동', phoneNumber: '010-1234-5678' }

describe('parseFlowSession', () => {
  it('객체 · JSON 문자열 둘 다 받는다', () => {
    const expected = { v: 1, ...BASE }
    expect(parseFlowSession({ v: 1, ...BASE })).toEqual(expected)
    expect(parseFlowSession(JSON.stringify({ v: 1, ...BASE }))).toEqual(expected)
  })

  it('허용 키 밖은 버린다 — activationCode 등은 세션에 남지 않는다', () => {
    const parsed = parseFlowSession({
      v: 1,
      ...BASE,
      productOrderId: 2026092399999999,
      activationCode: 'LPA:1$x$y',
      receiverName: '김철수',
    })
    expect(parsed).toEqual({ v: 1, ...BASE, productOrderId: 2026092399999999 })
    expect(Object.keys(parsed ?? {}).sort()).toEqual(
      ['fullName', 'orderId', 'phoneNumber', 'productOrderId', 'v'].sort(),
    )
  })

  it.each([
    null,
    undefined,
    '',
    'not-json',
    '[]',
    42,
    { ...BASE },
    { v: 2, ...BASE },
    { v: 1, ...BASE, orderId: 0 },
    { v: 1, ...BASE, orderId: -1 },
    { v: 1, ...BASE, orderId: 1.5 },
    { v: 1, ...BASE, orderId: '2026092312345678' },
    { v: 1, ...BASE, orderId: Number.MAX_SAFE_INTEGER + 2 },
    { v: 1, ...BASE, fullName: '  ' },
    { v: 1, ...BASE, phoneNumber: '' },
  ])('잘못된 값 %j → null', (raw) => {
    expect(parseFlowSession(raw)).toBeNull()
  })

  it('productOrderId 가 이상하면 그 필드만 버린다 (세션은 유지)', () => {
    expect(parseFlowSession({ v: 1, ...BASE, productOrderId: 'x' })).toEqual({ v: 1, ...BASE })
  })
})

describe('buildFlowSession', () => {
  it('정상 입력 → v1 세션', () => {
    expect(buildFlowSession(BASE)).toEqual({ v: 1, ...BASE })
    expect(buildFlowSession({ ...BASE, productOrderId: 2026092312345679 })).toEqual({
      v: 1,
      ...BASE,
      productOrderId: 2026092312345679,
    })
  })

  it('보통 크기는 300B 미만 (spec 불변식)', () => {
    const session = buildFlowSession({
      ...BASE,
      fullName: '남궁민수민수',
      productOrderId: 2026092312345679,
    })
    expect(session).not.toBeNull()
    expect(flowCookieSize(session!)).toBeLessThan(300)
  })

  it('1KB 를 넘는 입력은 쓰지 않는다', () => {
    expect(buildFlowSession({ ...BASE, fullName: '가'.repeat(200) })).toBeNull()
  })

  it('잘못된 입력은 null', () => {
    expect(buildFlowSession({ ...BASE, orderId: Number.NaN })).toBeNull()
  })
})

describe('상수', () => {
  it('쿠키 이름 · 1시간', () => {
    expect(FLOW_COOKIE).toBe('nomacom_flow')
    expect(FLOW_COOKIE_MAX_AGE).toBe(3600)
  })
})
