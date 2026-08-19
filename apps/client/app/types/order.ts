export interface Order {
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
  startDate: string;
  startTime: number;
  endDate: string;
  startCountry: string;
  startTimeZone: string;
  planTypeId: string;
  esims: Esim[];
  /** 상품주문 단위 취소/클레임 상태 — details 카드 "취소된 주문" disabled 표시 */
  cancelled?: boolean;
  /** 취소철회 가능 여부 — CANCEL_REQUEST 단계만 true (CANCEL_DONE 은 철회 불가) */
  cancelWithdrawable?: boolean;
}

export interface Esim {
  apn: string;
  manualCode: string;
  smdpAddress: string;
  networkStatus: string;
  serviceStatus: string;
  activationCode: string;
}
