/**
 * 테스트 체크아웃 `/checkout-preview` (K9 · spec F-19) — PG 심사 캡처 전용. 주문 저장 · 발급 · 서버 호출 없음.
 *
 * 상품 값(shell D-13 · catalog F-12): 심사는 «표시 금액 = 라이브 판매가» 를 보므로 실상품 · 실가격을 쓴다 —
 *   K1 카탈로그의 `PREVIEW_OPTION_CODE` 옵션(프랑스 무제한 매일 1GB · 7일)에서 SSR 때 읽는다(페이지 전용 라우트).
 *   주문 저장 · 발급 · 결제 서버 호출은 여전히 0.
 * 상품명에 «TEST» 금지 · 0원 금지 · 동의 체크 기본 해제 — PortOne / 토스 심사 요건.
 */

export const PREVIEW_OPTION_CODE = 'FRA00U01D07V2'

export interface PreviewItem {
  productName: string
  optionName: string
  usage: string
  quantity: 1
  amount: number
  /** PortOne orderName — 100자 이하 */
  orderName: string
}

export function previewItemFrom(
  zoneLabel: string,
  kind: 'U' | 'L',
  option: { cap: number; days: number; finalWon: number },
): PreviewItem {
  const productName = `${zoneLabel} eSIM ${kind === 'U' ? '무제한' : '종량제'}`
  const cap = kind === 'U' ? `매일 ${option.cap}GB` : `총 ${option.cap}GB`
  return {
    productName,
    optionName: kind === 'U' ? `${cap} · 소진 후 512kbps · ${option.days}일` : `${cap} · ${option.days}일`,
    usage: `현지에서 처음 연결한 때부터 24시간 단위로 ${option.days}일`,
    quantity: 1,
    amount: option.finalWon,
    orderName: `${productName} · ${cap} · ${option.days}일`,
  }
}

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

/** 이 탭이 방금 만든 결제 ID — 복귀 쿼리가 이것과 같을 때만 결과를 그린다(링크로 만든 임의 쿼리 무시) */
export const PENDING_PAYMENT_KEY = 'nomacom_checkout_preview_payment'

export const RESULT_MESSAGE_MAX = 80

const first = (value: unknown): unknown => (Array.isArray(value) ? value[0] : value)
const text = (value: unknown): string | null =>
  typeof value === 'string' && value.trim() ? value.trim() : null

/**
 * 결제창 복귀 쿼리 해석 — forceRedirect 로 PC · 모바일 모두 `redirectUrl?paymentId=…&code=…&message=…` 로 돌아온다.
 * - `paymentId` 가 형식에 맞고 `expectedPaymentId`(이 탭이 만든 ID)와 같을 때만 결과를 낸다 (spec S-7 · QA ⑥ 반사 텍스트 차단)
 * - code 가 있으면 실패 · 취소. message 는 80자까지, 없으면 pgMessage → code 순
 */
export function readPaymentResult(
  query: Record<string, unknown>,
  expectedPaymentId: string | null,
): PaymentResult {
  const paymentId = text(first(query.paymentId))
  if (!paymentId || !PAYMENT_ID_PATTERN.test(paymentId) || paymentId !== expectedPaymentId) {
    return { status: 'none' }
  }
  const code = text(first(query.code))
  if (!code) return { status: 'success', paymentId }
  const message = text(first(query.message)) ?? text(first(query.pgMessage)) ?? code
  return { status: 'failed', paymentId, message: message.slice(0, RESULT_MESSAGE_MAX) }
}

/** requestPayment 응답(창 없이 끝난 경우 포함)의 5필드 — PortOne PaymentResponse 의 부분 */
export interface PaymentResponseLike {
  paymentId?: string
  code?: string
  message?: string
  pgCode?: string
  pgMessage?: string
}

/**
 * 창 없이 끝난 응답을 복귀 쿼리로 (spec F-19) — 결과 처리는 readPaymentResult 하나로 모은다.
 * 응답에 결제 ID 가 없으면 이 탭이 만든 ID 를 쓴다(결과 줄이 «none» 으로 사라지지 않게).
 */
export function buildReturnQuery(
  response: PaymentResponseLike,
  localPaymentId: string,
): Record<string, string | undefined> {
  return {
    paymentId: response.paymentId || localPaymentId,
    code: response.code,
    message: response.message,
    pgCode: response.pgCode,
    pgMessage: response.pgMessage,
  }
}
