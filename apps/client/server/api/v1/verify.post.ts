import { eq, inArray } from 'drizzle-orm'
import { useDB, schema } from '../../db'
import { matchesOrderContact } from '../../utils/verification'

interface VerifyOrderRequest {
  fullName: string
  phoneNumber: string
  orderId: number
  productOrderId?: number
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

interface VerifyOrderResponse {
  verified: boolean
  cancelled?: boolean
  details?: OrderDetails[]
}

export default defineEventHandler(async (event): Promise<VerifyOrderResponse> => {
  const body = await readBody<VerifyOrderRequest>(event)

  // Validate required fields
  if (!body.fullName || !body.phoneNumber || !body.orderId) {
    throw createError({
      statusCode: 400,
      message: 'Missing required fields: fullName, phoneNumber, orderId',
    })
  }

  const db = useDB()

  // Query orders with matching orderId, including esims
  const ordersWithEsims = await db.query.orders.findMany({
    where: eq(schema.orders.orderId, body.orderId),
    with: {
      esims: true,
    },
  })

  // No orders found
  if (ordersWithEsims.length === 0) {
    return {
      verified: false,
    }
  }

  // 주문 연락처 대조 (군간 AND + 군내 OR — 선물 주문 커버) — orderId 만으로
  // 타인의 PII / activationCode 조회 차단. 불일치 시 취소 여부 등 어떤 정보도
  // 노출하지 않고 verified:false 만 반환
  const contactMatched = ordersWithEsims.some((order) =>
    matchesOrderContact({ fullName: body.fullName, phoneNumber: body.phoneNumber }, order),
  )

  if (!contactMatched) {
    return {
      verified: false,
    }
  }

  // Check if order is cancelled
  const firstOrder = ordersWithEsims[0]
  if (
    firstOrder.lastChangedType === 'CLAIM_REQUESTED' ||
    firstOrder.lastChangedType === 'CLAIM_COMPLETED'
  ) {
    return {
      verified: true,
      cancelled: true,
    }
  }

  // Build response with plan type information (planTypes 는 일괄 조회 — N+1 방지)
  const planTypeIds = [
    ...new Set(ordersWithEsims.map((order) => order.optionManageCode).filter(Boolean)),
  ] as string[]

  const planTypeRows = planTypeIds.length
    ? await db.query.planTypes.findMany({
        where: inArray(schema.planTypes.planTypeId, planTypeIds),
      })
    : []
  const planTypesById = new Map(planTypeRows.map((pt) => [pt.planTypeId, pt]))

  const details: OrderDetails[] = []

  for (const order of ordersWithEsims) {
    const planType = planTypesById.get(order.optionManageCode || '')

    // Map esims to response format
    const esimResponses: EsimResponse[] = order.esims.map((esim) => ({
      apn: esim.apn || '',
      manualCode: esim.manualCode || '',
      smdpAddress: esim.smdpAddress || '',
      networkStatus: esim.networkStatus || '',
      serviceStatus: esim.serviceStatus || '',
      activationCode: esim.activationCode || '',
    }))

    const orderDetail: OrderDetails = {
      orderId: order.orderId || 0,
      productOrderId: order.productOrderId,
      productName: order.productName || '',
      placeOrderDate: order.placeOrderDate || new Date(),
      quantity: order.quantity || 0,
      totalPaymentAmount: order.totalPaymentAmount || 0,
      optionManageCode: order.optionManageCode || '',
      receiverName: order.receiverName || '',
      receiverPhoneNumber: order.receiverPhoneNumber || '',
      planNameKr: planType?.planNameKr || '',
      planDataTypeKr: planType?.planDataTypeKr || '',
      planDataLimitKr: planType?.planDataLimitKr || '',
      planDataDuration: planType?.planDataDuration || 0,
      planCountriesKr: planType?.planCountriesKr || [],
      planCountriesEng: planType?.planCountriesEng || [],
      planCountriesIso: planType?.planCountriesIso || [],
      timeZones: planType?.timeZones || [],
      planTypeId: planType?.planTypeId || '',
      esims: esimResponses,
    }

    details.push(orderDetail)
  }

  // Filter by productOrderId if provided
  if (body.productOrderId) {
    const filteredDetails = details.filter(
      (detail) => detail.productOrderId === body.productOrderId,
    )
    return {
      verified: true,
      cancelled: false,
      details: filteredDetails,
    }
  }

  return {
    verified: true,
    cancelled: false,
    details,
  }
})
