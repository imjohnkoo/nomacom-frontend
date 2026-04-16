import { eq, and } from 'drizzle-orm';
import { useDB, schema } from '../../db';

interface VerifyOrderRequest {
  fullName: string;
  phoneNumber: string;
  orderId: number;
  productOrderId?: number;
}

interface EsimResponse {
  apn: string;
  manualCode: string;
  smdpAddress: string;
  networkStatus: string;
  serviceStatus: string;
  activationCode: string;
}

interface OrderDetails {
  orderId: number;
  productOrderId: number;
  productName: string;
  placeOrderDate: Date;
  quantity: number;
  totalPaymentAmount: number;
  optionManageCode: string;
  receiverName: string;
  receiverPhoneNumber: string;
  planNameKr: string;
  planDataTypeKr: string;
  planDataLimitKr: string;
  planDataDuration: number;
  planCountriesKr: string[];
  planCountriesEng: string[];
  planCountriesIso: string[];
  timeZones: string[];
  planTypeId: string;
  esims: EsimResponse[];
}

interface VerifyOrderResponse {
  verified: boolean;
  cancelled?: boolean;
  details?: OrderDetails[];
}

export default defineEventHandler(async (event): Promise<VerifyOrderResponse> => {
  const body = await readBody<VerifyOrderRequest>(event);

  // Validate required fields
  if (!body.fullName || !body.phoneNumber || !body.orderId) {
    throw createError({
      statusCode: 400,
      message: 'Missing required fields: fullName, phoneNumber, orderId',
    });
  }

  const db = useDB();

  // Query orders with matching orderId, including esims
  const ordersWithEsims = await db.query.orders.findMany({
    where: eq(schema.orders.orderId, body.orderId),
    with: {
      esims: true,
    },
  });

  // No orders found
  if (ordersWithEsims.length === 0) {
    return {
      verified: false,
    };
  }

  // Check if order is cancelled
  const firstOrder = ordersWithEsims[0];
  if (
    firstOrder.lastChangedType === 'CLAIM_REQUESTED' ||
    firstOrder.lastChangedType === 'CLAIM_COMPLETED'
  ) {
    return {
      verified: true,
      cancelled: true,
    };
  }

  // Build response with plan type information
  const details: OrderDetails[] = [];

  for (const order of ordersWithEsims) {
    // Get plan type by optionManageCode
    const planType = await db.query.planTypes.findFirst({
      where: eq(schema.planTypes.planTypeId, order.optionManageCode || ''),
    });

    // Map esims to response format
    const esimResponses: EsimResponse[] = order.esims.map((esim) => ({
      apn: esim.apn || '',
      manualCode: esim.manualCode || '',
      smdpAddress: esim.smdpAddress || '',
      networkStatus: esim.networkStatus || '',
      serviceStatus: esim.serviceStatus || '',
      activationCode: esim.activationCode || '',
    }));

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
    };

    details.push(orderDetail);
  }

  // Filter by productOrderId if provided
  if (body.productOrderId) {
    const filteredDetails = details.filter(
      (detail) => detail.productOrderId === body.productOrderId
    );
    return {
      verified: true,
      cancelled: false,
      details: filteredDetails,
    };
  }

  return {
    verified: true,
    cancelled: false,
    details,
  };
});
