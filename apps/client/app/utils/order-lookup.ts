/**
 * 주문번호 조회(홈 카드 · /my-esim) — 입력 정규화 · 검증 · 발급 호스트 이동 URL (spec F-9 · D-15).
 *
 * 판매 호스트(esimmany.com)에서 받은 주문번호는 발급 호스트(app.esimmany.com)의 /verify/{주문번호} 로 보낸다(K3).
 * API 가 orderId 를 JS number 로 받으므로 안전 정수 범위를 넘는 번호는 받지 않는다 — 17자리 이상은 다른 번호가 된다.
 */

export type OrderLookupError = 'empty' | 'not-digits' | 'length'

export const ORDER_LOOKUP_MESSAGES: Record<OrderLookupError, string> = {
  empty: '주문번호를 입력해 주세요.',
  'not-digits': '주문번호는 숫자만 입력해 주세요.',
  length: '주문번호 자릿수를 다시 확인해 주세요.',
}

const MIN_DIGITS = 10
const MAX_DIGITS = 16

/** 공백 · 하이픈 제거 (주문 상세에서 복사해 붙인 «2026 0923-1234 5678» 같은 입력) */
export function normalizeOrderInput(raw: string): string {
  return raw.replace(/[\s-]/g, '')
}

export type OrderLookupResult =
  | { ok: true; orderId: string }
  | { ok: false; error: OrderLookupError }

export function validateOrderNumber(raw: string): OrderLookupResult {
  const value = normalizeOrderInput(raw)
  if (!value) return { ok: false, error: 'empty' }
  if (!/^\d+$/.test(value)) return { ok: false, error: 'not-digits' }
  if (value.length < MIN_DIGITS || value.length > MAX_DIGITS) return { ok: false, error: 'length' }
  // 첫 자리 0 은 Number() 가 떼어 자릿수가 줄어든다 · 2^53−1 을 넘으면 정밀도가 깨진다 (spec D-15)
  if (value.startsWith('0') || !Number.isSafeInteger(Number(value))) {
    return { ok: false, error: 'length' }
  }
  return { ok: true, orderId: value }
}

export function buildGuestVerifyUrl(guestAppOrigin: string, orderId: string): string {
  return `${guestAppOrigin.replace(/\/+$/, '')}/verify/${orderId}`
}
