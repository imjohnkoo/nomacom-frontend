import { eq } from 'drizzle-orm'
import { useDB, schema } from '../../db'
import { useMayaApi } from '../../utils/maya-api'
import { generateEsimTag } from '../../utils/string'
import { createUTCDateTime, createLocalDateTime } from '../../utils/date'
import { matchesReceiver } from '../../utils/verification'

// 같은 productOrderId 에 대한 동시 발급 요청 직렬화 (더블클릭/재시도 race 방어).
// 단일 Nitro 인스턴스 (CodeDeploy EC2 1대) 전제 — 다중 인스턴스 확장 시 DB 레벨
// 락 (advisory lock 등) 으로 교체 필요. prod DB 스키마는 backend 와 공유라 제약
// 추가 대신 app 레벨 방어 우선.
const inFlightActivations = new Map<number, Promise<void>>()

interface ActivateOrderRequest {
  receiverName: string
  receiverPhoneNumber: string
  optionManageCode: string
  orderId: number
  placeOrderDate: string
  planCountriesKr: string[]
  planDataDuration: number
  planDataTypeKr: string
  planNameKr: string
  planTypeId: string
  productName: string
  productOrderId: number
  quantity: number
  startCountry: string
  startDate: string
  startTime: number
  endDate: string
  startTimeZone: string
  totalPaymentAmount: number
}

interface EsimResponse {
  apn: string
  manualCode: string
  smdpAddress: string
  networkStatus: string
  serviceStatus: string
  activationCode: string
}

interface OrderDetails {
  orderId: number
  productOrderId: number
  productName: string
  placeOrderDate: Date
  quantity: number
  totalPaymentAmount: number
  optionManageCode: string
  receiverName: string
  receiverPhoneNumber: string
  planNameKr: string
  planDataTypeKr: string
  planDataLimitKr: string
  planDataDuration: number
  planCountriesKr: string[]
  planCountriesEng: string[]
  planCountriesIso: string[]
  timeZones: string[]
  planTypeId: string
  esims: EsimResponse[]
}

interface ActivateOrderResponse {
  verified: boolean
  cancelled?: boolean
  details?: OrderDetails[]
}

export default defineEventHandler(async (event): Promise<ActivateOrderResponse> => {
  const body = await readBody<ActivateOrderRequest>(event)

  // Validate required fields
  if (
    !body.productOrderId ||
    !body.orderId ||
    !body.startDate ||
    !body.startTimeZone ||
    !body.receiverName ||
    !body.receiverPhoneNumber
  ) {
    throw createError({
      statusCode: 400,
      message: 'Missing required fields',
    })
  }

  const db = useDB()

  // 같은 주문의 진행 중 발급이 끝날 때까지 대기 — 이후 DB 재조회로 이미 발급된
  // 수량을 반영하므로 중복 요청은 자연스럽게 idempotent 응답으로 수렴
  while (inFlightActivations.has(body.productOrderId)) {
    await inFlightActivations.get(body.productOrderId)
  }
  let releaseLock!: () => void
  inFlightActivations.set(
    body.productOrderId,
    new Promise<void>((resolve) => {
      releaseLock = resolve
    }),
  )

  try {
    // Verify order exists (lock 획득 후 조회 — esims 수가 최신이어야 resume 이 정확)
    const order = await db.query.orders.findFirst({
      where: eq(schema.orders.productOrderId, body.productOrderId),
      with: {
        esims: true,
      },
    })

    if (!order) {
      throw createError({
        statusCode: 404,
        message: 'Order not found',
      })
    }

    // 수신자 대조 — productOrderId 만으로 타인 주문의 발급 트리거 + activationCode 조회 차단
    if (
      !matchesReceiver(
        { fullName: body.receiverName, phoneNumber: body.receiverPhoneNumber },
        { receiverName: order.receiverName, receiverPhoneNumber: order.receiverPhoneNumber },
      )
    ) {
      throw createError({
        statusCode: 403,
        message: 'Receiver information does not match',
      })
    }

    // Get plan type
    const planType = await db.query.planTypes.findFirst({
      where: eq(schema.planTypes.planTypeId, body.optionManageCode),
    })

    if (!planType) {
      throw createError({
        statusCode: 404,
        message: 'Plan type not found',
      })
    }

    // 벤더 가드 (backend Spark Wave 1) — 이 엔드포인트는 Maya 발급 전용.
    // provider 가 NULL 이면 maya 로 간주, 그 외 벤더 상품이 들어오면 발급 사고 방지 위해 거부
    if (planType.provider != null && planType.provider !== 'maya') {
      throw createError({
        statusCode: 409,
        message: `Plan type is routed to provider '${planType.provider}' and cannot be issued here`,
      })
    }

    const mayaApi = useMayaApi()
    const quantity = order.quantity || 1
    const existingCount = order.esims?.length || 0

    // 부족분만 이어서 발급 (resume) — 이전 시도가 중간 실패로 부분 발급 상태여도
    // 재시도로 정상 완료 가능. 이미 전량 발급된 경우 루프를 건너뛰고 현재 상태 반환
    for (let i = existingCount; i < quantity; i++) {
      // Generate unique tag
      const tag = generateEsimTag(order, i)

      // Maya 발급은 외부 side-effect — 성공분은 반드시 즉시 DB 에 기록 (순서 유지).
      // esim + plan 쌍만 트랜잭션으로 묶어 plan 누락 상태를 방지
      const mayaEsim = await mayaApi.createEsim({
        tag,
        region: 'global',
      })

      const newEsim: typeof schema.esims.$inferInsert = {
        esimId: mayaEsim.iccid,
        apn: mayaEsim.apn,
        tag: mayaEsim.tag || tag,
        uid: mayaEsim.uid,
        iccid: mayaEsim.iccid,
        state: mayaEsim.state,
        autoApn: mayaEsim.auto_apn,
        manualCode: mayaEsim.manual_code,
        smdpAddress: mayaEsim.smdp_address,
        dateAssigned: mayaEsim.date_assigned ? new Date(mayaEsim.date_assigned) : new Date(),
        networkStatus: mayaEsim.network_status,
        serviceStatus: mayaEsim.service_status,
        activationCode: mayaEsim.activation_code,
        orderId: order.productOrderId,
      }

      const newPlan: typeof schema.plans.$inferInsert = {
        esimId: mayaEsim.iccid,
        planTypeId: planType.planTypeId,
        isActivated: false,
        startDateEntered: body.startDate,
        startTimeEntered: body.startTime,
        startTimeZoneEntered: body.startTimeZone,
        startCountryEntered: body.startCountry,
        timeToBeActivatedInUTC: createUTCDateTime(
          body.startDate,
          body.startTime,
          body.startTimeZone,
        ),
        timeToBeActivatedInLocal: createLocalDateTime(
          body.startDate,
          body.startTime,
          body.startTimeZone,
        ),
      }

      await db.transaction(async (tx) => {
        await tx.insert(schema.esims).values(newEsim)
        await tx.insert(schema.plans).values(newPlan)
      })
    }

    // Return updated order with eSIMs
    const updatedOrder = await db.query.orders.findFirst({
      where: eq(schema.orders.productOrderId, body.productOrderId),
      with: {
        esims: true,
      },
    })

    if (!updatedOrder) {
      throw createError({
        statusCode: 500,
        message: 'Failed to retrieve updated order',
      })
    }

    // Build response
    const esimResponses: EsimResponse[] = (updatedOrder.esims || []).map((esim) => ({
      apn: esim.apn || '',
      manualCode: esim.manualCode || '',
      smdpAddress: esim.smdpAddress || '',
      networkStatus: esim.networkStatus || '',
      serviceStatus: esim.serviceStatus || '',
      activationCode: esim.activationCode || '',
    }))

    const orderDetail: OrderDetails = {
      orderId: updatedOrder.orderId || 0,
      productOrderId: updatedOrder.productOrderId,
      productName: updatedOrder.productName || '',
      placeOrderDate: updatedOrder.placeOrderDate || new Date(),
      quantity: updatedOrder.quantity || 0,
      totalPaymentAmount: updatedOrder.totalPaymentAmount || 0,
      optionManageCode: updatedOrder.optionManageCode || '',
      receiverName: updatedOrder.receiverName || '',
      receiverPhoneNumber: updatedOrder.receiverPhoneNumber || '',
      planNameKr: planType.planNameKr || '',
      planDataTypeKr: planType.planDataTypeKr || '',
      planDataLimitKr: planType.planDataLimitKr || '',
      planDataDuration: planType.planDataDuration || 0,
      planCountriesKr: planType.planCountriesKr || [],
      planCountriesEng: planType.planCountriesEng || [],
      planCountriesIso: planType.planCountriesIso || [],
      timeZones: planType.timeZones || [],
      planTypeId: planType.planTypeId,
      esims: esimResponses,
    }

    return {
      verified: true,
      cancelled: false,
      details: [orderDetail],
    }
  } finally {
    inFlightActivations.delete(body.productOrderId)
    releaseLock()
  }
})
