import { eq } from 'drizzle-orm';
import { useDB, schema } from '../../db';
import { useMayaApi } from '../../utils/maya-api';
import { generateEsimTag } from '../../utils/string';
import { createUTCDateTime, createLocalDateTime } from '../../utils/date';

interface ActivateOrderRequest {
  receiverName: string;
  receiverPhoneNumber: string;
  optionManageCode: string;
  orderId: number;
  placeOrderDate: string;
  planCountriesKr: string[];
  planDataDuration: number;
  planDataTypeKr: string;
  planNameKr: string;
  planTypeId: string;
  productName: string;
  productOrderId: number;
  quantity: number;
  startCountry: string;
  startDate: string;
  startTime: number;
  endDate: string;
  startTimeZone: string;
  totalPaymentAmount: number;
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

interface ActivateOrderResponse {
  verified: boolean;
  cancelled?: boolean;
  details?: OrderDetails[];
}

export default defineEventHandler(async (event): Promise<ActivateOrderResponse> => {
  const body = await readBody<ActivateOrderRequest>(event);

  // Validate required fields
  if (!body.productOrderId || !body.orderId || !body.startDate || !body.startTimeZone) {
    throw createError({
      statusCode: 400,
      message: 'Missing required fields',
    });
  }

  const db = useDB();

  // Verify order exists
  const order = await db.query.orders.findFirst({
    where: eq(schema.orders.productOrderId, body.productOrderId),
    with: {
      esims: true,
    },
  });

  if (!order) {
    throw createError({
      statusCode: 404,
      message: 'Order not found',
    });
  }

  // Check if eSIMs already exist
  if (order.esims && order.esims.length > 0) {
    throw createError({
      statusCode: 400,
      message: 'eSIMs already exist for this order',
    });
  }

  // Get plan type
  const planType = await db.query.planTypes.findFirst({
    where: eq(schema.planTypes.planTypeId, body.optionManageCode),
  });

  if (!planType) {
    throw createError({
      statusCode: 404,
      message: 'Plan type not found',
    });
  }

  const mayaApi = useMayaApi();
  const quantity = order.quantity || 1;

  // Create eSIMs
  for (let i = 0; i < quantity; i++) {
    // Generate unique tag
    const tag = generateEsimTag(order, i);

    // Create eSIM via Maya API
    const mayaEsim = await mayaApi.createEsim({
      tag,
      region: 'global',
    });

    // Save eSIM to database
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
    };

    await db.insert(schema.esims).values(newEsim);

    // Create plan for this eSIM
    const newPlan: typeof schema.plans.$inferInsert = {
      esimId: mayaEsim.iccid,
      planTypeId: planType.planTypeId,
      isActivated: false,
      startDateEntered: body.startDate,
      startTimeEntered: body.startTime,
      startTimeZoneEntered: body.startTimeZone,
      startCountryEntered: body.startCountry,
      timeToBeActivatedInUTC: createUTCDateTime(body.startDate, body.startTime, body.startTimeZone),
      timeToBeActivatedInLocal: createLocalDateTime(
        body.startDate,
        body.startTime,
        body.startTimeZone
      ),
    };

    await db.insert(schema.plans).values(newPlan);
  }

  // Return updated order with eSIMs
  const updatedOrder = await db.query.orders.findFirst({
    where: eq(schema.orders.productOrderId, body.productOrderId),
    with: {
      esims: true,
    },
  });

  if (!updatedOrder) {
    throw createError({
      statusCode: 500,
      message: 'Failed to retrieve updated order',
    });
  }

  // Build response
  const esimResponses: EsimResponse[] = (updatedOrder.esims || []).map((esim) => ({
    apn: esim.apn || '',
    manualCode: esim.manualCode || '',
    smdpAddress: esim.smdpAddress || '',
    networkStatus: esim.networkStatus || '',
    serviceStatus: esim.serviceStatus || '',
    activationCode: esim.activationCode || '',
  }));

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
  };

  return {
    verified: true,
    cancelled: false,
    details: [orderDetail],
  };
});
