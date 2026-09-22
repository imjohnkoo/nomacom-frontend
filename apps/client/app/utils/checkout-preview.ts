/**
 * 테스트 체크아웃 `/checkout-preview` (K9 · spec F-19) — PG 심사 캡처 전용. 주문 저장 · 발급 · 서버 호출 없음.
 *
 * 상품 값(D-13): 심사는 «표시 금액 = 라이브 판매가» 를 보므로 더미라도 실상품 · 실가격을 쓴다.
 *   v4.5 가격표(2026-09-21) FRA00 무제한 U01(매일 1GB) 7일 = 4,900원. W1-3 에서 K1 카탈로그 값으로 바꾼다.
 * 상품명에 «TEST» 금지 · 0원 금지 · 동의 체크 기본 해제 — PortOne / 토스 심사 요건.
 */

export const PREVIEW_ITEM = {
  productName: '프랑스 eSIM 무제한',
  optionName: '매일 1GB · 소진 후 512kbps · 7일',
  usage: '현지에서 처음 연결한 때부터 24시간 단위로 7일',
  quantity: 1,
  amount: 4900,
} as const

/** PortOne orderName — 100자 이하 */
export const PREVIEW_ORDER_NAME = `${PREVIEW_ITEM.productName} · 매일 1GB · 7일`

/** 토스(PortOne 경유) paymentId 규칙: 6~64자 · 영문 · 숫자 · - · _ */
export const PAYMENT_ID_PATTERN = /^[A-Za-z0-9_-]{6,64}$/

/** `pv-{밀리초}-{hex}` — crypto.randomUUID 는 HTTPS 에서만 동작해 getRandomValues 바이트를 받는다 */
export function createPaymentId(now: number, random: Uint8Array): string {
  const hex = Array.from(random, (byte) => byte.toString(16).padStart(2, '0')).join('')
  return `pv-${now}-${hex}`
}

export function formatWon(amount: number): string {
  return `${amount.toLocaleString('ko-KR')}원`
}

export type PaymentResult =
  | { status: 'none' }
  | { status: 'success'; paymentId: string }
  | { status: 'failed'; paymentId: string; message: string }

const first = (value: unknown): unknown => (Array.isArray(value) ? value[0] : value)
const text = (value: unknown): string | null =>
  typeof value === 'string' && value.trim() ? value.trim() : null

/**
 * 결제창 복귀 쿼리 해석 — forceRedirect 로 PC · 모바일 모두 `redirectUrl?paymentId=…&code=…&message=…` 로 돌아온다.
 * code 가 있으면 실패 · 취소. pgMessage 는 message 가 없을 때만 쓴다.
 */
export function readPaymentResult(query: Record<string, unknown>): PaymentResult {
  const paymentId = text(first(query.paymentId))
  if (!paymentId) return { status: 'none' }
  const code = text(first(query.code))
  if (!code) return { status: 'success', paymentId }
  const message = text(first(query.message)) ?? text(first(query.pgMessage)) ?? code
  return { status: 'failed', paymentId, message }
}
