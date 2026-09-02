import { eq } from 'drizzle-orm'
import { useDB, schema } from '../../db'
import { matchesOrderContact } from '../../utils/verification'
import { logEvent } from '../../utils/issuance-log'

/**
 * 취소철회 — 취소요청 (CANCEL_REQUEST) 대기 중인 상품주문의 취소를 철회하고 발급 흐름을 연다.
 *
 * Naver 에는 철회 전용 API 가 없어 발송처리(dispatch) 가 공식 우회 경로다. Naver 호출·
 * DB 갱신은 backend (esim-manager) 내부 endpoint 가 전담하고, 여기서는 수신자 대조와
 * 상태 사전 체크 후 위임만 한다 (Naver 자격증명/IP 화이트리스트는 backend 단일 소유).
 * 계약/흐름: docs/proposals/client/2026-08-19-cancel-withdrawal-proposal.md §4
 */

interface WithdrawCancelRequest {
  fullName: string
  phoneNumber: string
  orderId: number
  productOrderId: number
}

interface WithdrawCancelResponse {
  withdrawn: boolean
}

interface BackendConflictData {
  result?: string
  code?: 'CANCEL_DONE' | 'NOT_CANCEL_REQUEST'
  message?: string
}

// 같은 상품주문의 중복 철회 요청 차단 (더블클릭/재시도) — activate 의 in-flight lock 과
// 동일하게 단일 Nitro 인스턴스 전제
const inFlightWithdrawals = new Set<number>()

export default defineEventHandler(async (event): Promise<WithdrawCancelResponse> => {
  const body = await readBody<WithdrawCancelRequest>(event)

  if (!body.fullName || !body.phoneNumber || !body.orderId || !body.productOrderId) {
    throw createError({
      statusCode: 400,
      message: 'Missing required fields: fullName, phoneNumber, orderId, productOrderId',
    })
  }

  const internalEndpoint = process.env.ESIM_MANAGER_INTERNAL_ENDPOINT
  const internalSecret = process.env.ESIM_MANAGER_INTERNAL_SECRET
  if (!internalEndpoint || !internalSecret) {
    // backend 취소철회 endpoint 배포 전 — 기능 비활성 상태로 안전 실패
    throw createError({ statusCode: 503, message: 'Cancel withdrawal is not available yet' })
  }

  const db = useDB()
  const order = await db.query.orders.findFirst({
    where: eq(schema.orders.productOrderId, body.productOrderId),
  })

  if (!order || order.orderId !== body.orderId) {
    throw createError({ statusCode: 404, message: 'Order not found' })
  }

  // 수신자 대조 — productOrderId 만으로 타인 주문의 취소철회 (주문 상태 변경) 차단
  if (
    !matchesOrderContact({ fullName: body.fullName, phoneNumber: body.phoneNumber }, order)
  ) {
    logEvent('CANCEL_WITHDRAW_REJECTED', 'warn', 'contact mismatch', {
      productOrderId: body.productOrderId,
      reason: 'CONTACT_MISMATCH',
    })
    throw createError({ statusCode: 403, message: 'Receiver verification failed' })
  }

  // 상태 사전 체크 — 철회는 취소요청 대기 (CANCEL_REQUEST) 에서만 가능.
  // 취소완료 (CANCEL_DONE) 는 환불 종결이라 불가 (실시간 재확인은 backend 가 수행)
  if (order.claimType !== 'CANCEL' || order.claimStatus !== 'CANCEL_REQUEST') {
    const code = order.claimStatus === 'CANCEL_DONE' ? 'CANCEL_DONE' : 'NOT_CANCEL_REQUEST'
    logEvent('CANCEL_WITHDRAW_REJECTED', 'warn', 'not in withdrawable state', {
      productOrderId: body.productOrderId,
      reason: code,
      claimStatus: order.claimStatus,
    })
    throw createError({
      statusCode: 409,
      message: 'Order is not in a withdrawable cancel state',
      data: { code },
    })
  }

  if (inFlightWithdrawals.has(body.productOrderId)) {
    throw createError({
      statusCode: 409,
      message: 'Withdrawal already in progress',
      data: { code: 'IN_PROGRESS' },
    })
  }
  inFlightWithdrawals.add(body.productOrderId)

  try {
    logEvent('CANCEL_WITHDRAW_REQUESTED', 'info', `withdraw requested for ${body.productOrderId}`, {
      orderId: body.orderId,
      productOrderId: body.productOrderId,
    })

    // backend 가 Naver 실시간 재확인 → dispatch (철회) → 공유 DB 즉시 갱신까지 수행
    await $fetch(`${internalEndpoint}/internal/product-orders/withdraw-cancel`, {
      method: 'POST',
      headers: {
        'X-Internal-Auth': internalSecret,
        'Content-Type': 'application/json',
      },
      body: { productOrderId: String(body.productOrderId) },
      timeout: 15000,
    })

    logEvent('CANCEL_WITHDRAWN', 'info', `cancel withdrawn for ${body.productOrderId}`, {
      orderId: body.orderId,
      productOrderId: body.productOrderId,
    })
    return { withdrawn: true }
  } catch (e) {
    const err = e as { statusCode?: number; status?: number; data?: BackendConflictData }
    const upstreamStatus = err.statusCode ?? err.status

    // backend 의 경합 판정 (실시간 재확인/dispatch 실패) 은 409 로 그대로 전달
    if (upstreamStatus === 409) {
      logEvent('CANCEL_WITHDRAW_REJECTED', 'warn', 'backend conflict', {
        productOrderId: body.productOrderId,
        reason: err.data?.code ?? 'CONFLICT',
      })
      throw createError({
        statusCode: 409,
        message: err.data?.message ?? 'Order is not in a withdrawable cancel state',
        data: { code: err.data?.code ?? 'NOT_CANCEL_REQUEST' },
      })
    }

    logEvent('CANCEL_WITHDRAW_FAILED', 'error', `backend call failed for ${body.productOrderId}`, {
      productOrderId: body.productOrderId,
      upstreamStatus: upstreamStatus ?? null,
    })
    throw createError({ statusCode: 502, message: 'Failed to withdraw cancellation' })
  } finally {
    inFlightWithdrawals.delete(body.productOrderId)
  }
})
