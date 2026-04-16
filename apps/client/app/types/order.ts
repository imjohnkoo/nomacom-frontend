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
}

export interface Esim {
  apn: string;
  manualCode: string;
  smdpAddress: string;
  networkStatus: string;
  serviceStatus: string;
  activationCode: string;
}
