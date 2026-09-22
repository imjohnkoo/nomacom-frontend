import { describe, expect, it } from 'vitest'
import type { Esim, Order } from '../types/order'
import {
  detailsPath,
  flowStepOf,
  isFullyIssued,
  parseOrderIdParam,
  resolveFlowRedirect,
  reverifyPath,
  type FlowStep,
} from './flow-guard'

const ORDER_ID = 2026092312345678
const OTHER_ORDER_ID = 2026092387654321

const esim = (): Esim => ({
  apn: 'plus',
  manualCode: 'MANUAL',
  smdpAddress: 'smdp.example',
  networkStatus: 'NOT_ACTIVE',
  serviceStatus: 'ACTIVE',
  activationCode: 'LPA:1$smdp.example$MANUAL',
})

const order = (over: Partial<Order> = {}): Order =>
  ({
    orderId: ORDER_ID,
    productOrderId: ORDER_ID + 1,
    quantity: 1,
    esims: [],
    cancelled: false,
    ...over,
  }) as Order

// 판정표의 열
const cases = {
  noOrders: () => ({ orders: null, selected: null }),
  noSelection: () => ({ orders: [order()], selected: null }),
  // 발급된 eSIM 이 있는 취소 상품 — 발급 0 인 취소 상품은 zeroIssued 열이 판정한다(spec S-8 판정 순서)
  cancelled: () => {
    const o = order({ cancelled: true, quantity: 2, esims: [esim()] })
    return { orders: [o], selected: o }
  },
  fullyIssued: () => {
    const o = order({ quantity: 2, esims: [esim(), esim()] })
    return { orders: [o], selected: o }
  },
  zeroIssued: () => {
    const o = order()
    return { orders: [o], selected: o }
  },
  partial: () => {
    const o = order({ quantity: 2, esims: [esim()] })
    return { orders: [o], selected: o }
  },
}

const PASS = null
const V = reverifyPath(ORDER_ID)
const D = detailsPath(ORDER_ID)

// spec §5 S-8 판정표 — 행: 화면, 열: noOrders · noSelection · cancelled · fullyIssued · zeroIssued · partial
const TABLE: Record<FlowStep, (string | null)[]> = {
  verify: [PASS, PASS, PASS, PASS, PASS, PASS],
  details: [V, PASS, PASS, PASS, PASS, PASS],
  'select-date': [V, D, D, D, PASS, PASS],
  view: [V, D, PASS, PASS, D, PASS],
}

describe('resolveFlowRedirect — 판정표 전 칸', () => {
  const columns = Object.keys(cases) as (keyof typeof cases)[]
  for (const step of Object.keys(TABLE) as FlowStep[]) {
    columns.forEach((column, i) => {
      it(`${step} × ${column} → ${TABLE[step][i] ?? '통과'}`, () => {
        expect(resolveFlowRedirect(step, ORDER_ID, cases[column]())).toBe(TABLE[step][i])
      })
    })
  }
})

describe('resolveFlowRedirect — 판정 순서', () => {
  it('취소 + 발급 0 상품: select-date 는 취소로 · view 는 발급 0 으로 details', () => {
    const o = order({ cancelled: true })
    expect(resolveFlowRedirect('select-date', ORDER_ID, { orders: [o], selected: o })).toBe(D)
    expect(resolveFlowRedirect('view', ORDER_ID, { orders: [o], selected: o })).toBe(D)
  })
})

describe('resolveFlowRedirect — 다른 주문 · 목록 밖 선택', () => {
  it('store 목록이 다른 주문이면 «목록 없음» → 본인 확인', () => {
    const other = order({ orderId: OTHER_ORDER_ID, productOrderId: OTHER_ORDER_ID + 1 })
    expect(resolveFlowRedirect('details', ORDER_ID, { orders: [other], selected: other })).toBe(V)
  })

  it('선택 상품이 다른 주문이면 «선택 없음» → details', () => {
    const mine = order()
    const other = order({ orderId: OTHER_ORDER_ID, productOrderId: OTHER_ORDER_ID + 1 })
    expect(resolveFlowRedirect('view', ORDER_ID, { orders: [mine], selected: other })).toBe(D)
  })

  it('선택 상품이 목록에 없으면 «선택 없음» → details', () => {
    const listed = order()
    const stray = order({ productOrderId: ORDER_ID + 99, esims: [esim()] })
    expect(resolveFlowRedirect('view', ORDER_ID, { orders: [listed], selected: stray })).toBe(D)
  })
})

describe('flowStepOf', () => {
  it.each([
    ['/verify/1', 'verify'],
    ['/details/1', 'details'],
    ['/select-date/1?x=1', 'select-date'],
    ['/view/1#qr', 'view'],
  ] as const)('%s → %s', (path, step) => {
    expect(flowStepOf(path)).toBe(step)
  })

  it.each(['/', '/my-esim', '/viewer/1', '/checkout-preview'])('%s → null', (path) => {
    expect(flowStepOf(path)).toBeNull()
  })
})

describe('parseOrderIdParam', () => {
  it('숫자 문자열 → 수', () => {
    expect(parseOrderIdParam('2026092312345678')).toBe(2026092312345678)
    expect(parseOrderIdParam(['2026092312345678'])).toBe(2026092312345678)
  })

  it.each(['abc', 'NaN', '', '0', '-1', '1.5', '12e3', '9007199254740993', undefined, 42])(
    '%j → null',
    (param) => {
      expect(parseOrderIdParam(param)).toBeNull()
    },
  )
})

describe('isFullyIssued', () => {
  it('발급 수 ≥ 수량이면 전량 발급 (수량 0 은 1 로 본다)', () => {
    expect(isFullyIssued({ quantity: 1, esims: [esim()] })).toBe(true)
    expect(isFullyIssued({ quantity: 2, esims: [esim()] })).toBe(false)
    expect(isFullyIssued({ quantity: 0, esims: [] })).toBe(false)
  })
})
