import type { Order, Esim } from './order';

// Verify Order
export interface VerifyOrderRequest {
  fullName: string;
  phoneNumber: string;
  orderId: number;
  productOrderId?: number;
}

export interface VerifyOrderResponse {
  verified: boolean;
  cancelled?: boolean;
  details: Order[];
}

// Activate Order
export interface ActivateOrderRequest {
  receiverName: string;
  receiverPhoneNumber: string;
  optionManageCode: string;
  orderId: number;
  placeOrderDate: Date;
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

export interface ActivateOrderResponse extends VerifyOrderResponse {}

// Withdraw Cancel (취소철회) — CANCEL_REQUEST 대기 건만 가능
export interface WithdrawCancelRequest {
  fullName: string;
  phoneNumber: string;
  orderId: number;
  productOrderId: number;
}

export interface WithdrawCancelResponse {
  withdrawn: boolean;
}

// Re-export for convenience
export type { Order, Esim };
