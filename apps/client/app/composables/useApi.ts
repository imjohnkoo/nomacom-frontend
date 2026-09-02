import type {
  VerifyOrderRequest,
  VerifyOrderResponse,
  ActivateOrderRequest,
  ActivateOrderResponse,
  WithdrawCancelResponse,
} from '~/types/api';
import type { Order } from '~/types/order';

export const useApi = () => {
  const config = useRuntimeConfig();

  /**
   * Verify order with customer name and phone number
   */
  const verifyOrder = async (data: VerifyOrderRequest): Promise<VerifyOrderResponse> => {
    return await $fetch<VerifyOrderResponse>(`${config.public.apiBase}/verify`, {
      method: 'POST',
      body: data,
    });
  };

  /**
   * Activate order and generate eSIM QR codes
   */
  const activateOrder = async (order: Order): Promise<ActivateOrderResponse> => {
    const requestData: ActivateOrderRequest = {
      receiverName: order.receiverName,
      receiverPhoneNumber: order.receiverPhoneNumber,
      optionManageCode: order.optionManageCode,
      orderId: order.orderId,
      placeOrderDate: order.placeOrderDate,
      planCountriesKr: order.planCountriesKr,
      planDataDuration: order.planDataDuration,
      planDataTypeKr: order.planDataTypeKr,
      planNameKr: order.planNameKr,
      planTypeId: order.planTypeId,
      productName: order.productName,
      productOrderId: order.productOrderId,
      quantity: order.quantity,
      startCountry: order.startCountry,
      startDate: order.startDate,
      startTime: order.startTime,
      endDate: order.endDate,
      startTimeZone: order.startTimeZone,
      totalPaymentAmount: order.totalPaymentAmount,
    };

    return await $fetch<ActivateOrderResponse>(`${config.public.apiBase}/activate`, {
      method: 'POST',
      body: requestData,
    });
  };

  /**
   * Withdraw a pending cancel request (취소철회) and reopen issuance
   */
  const withdrawCancel = async (order: Order): Promise<WithdrawCancelResponse> => {
    return await $fetch<WithdrawCancelResponse>(`${config.public.apiBase}/withdraw-cancel`, {
      method: 'POST',
      body: {
        fullName: order.receiverName,
        phoneNumber: order.receiverPhoneNumber,
        orderId: order.orderId,
        productOrderId: order.productOrderId,
      },
    });
  };

  return {
    verifyOrder,
    activateOrder,
    withdrawCancel,
  };
};
