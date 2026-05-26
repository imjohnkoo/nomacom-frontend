import type { Order, Esim } from '~/types/order'

// 6 esim 디자인 시안 비교용. 실 prod 의 동유럽3개국 plan-type 기반 + activation code suffix 다양화.
const makeEsim = (n: number): Esim => {
  const suffixes = ['CFD59AE3', '7889E7AB', 'B45673A4', '01928374', '3F4E5A6B', '7C8D9EAF']
  const code = `TN20260414161839${suffixes[n - 1] || suffixes[0]}`
  return {
    apn: 'globaldata',
    manualCode: code,
    smdpAddress: 'consumer.e-sim.global',
    networkStatus: 'ENABLED',
    serviceStatus: 'active',
    activationCode: `LPA:1$consumer.e-sim.global$${code}`,
  }
}

export function buildMultiQrSeed(qty: number = 6): Order {
  return {
    orderId: 2026052435967091,
    productOrderId: 2026052484335791,
    productName: '[유럽이심전문] 동유럽3개국 무제한데이터',
    placeOrderDate: new Date('2026-05-24T00:06:09.224Z'),
    quantity: qty,
    totalPaymentAmount: 17700 * qty,
    optionManageCode: 'EU033U01D15V2',
    receiverName: '',
    receiverPhoneNumber: '',
    planNameKr: '동유럽3개국',
    planDataTypeKr: '무제한 데이터',
    planDataLimitKr: '매일 1기가 + 무제한 500Kbps',
    planDataDuration: 15,
    planCountriesKr: ['오스트리아', '체코', '헝가리'],
    planCountriesEng: ['Austria', 'Czechia', 'Hungary'],
    planCountriesIso: ['AUT', 'CZE', 'HUN'],
    timeZones: ['Europe/Vienna', 'Europe/Prague', 'Europe/Budapest'],
    startDate: '2026-06-01',
    startTime: 0,
    endDate: '2026-06-16',
    startCountry: '오스트리아',
    startTimeZone: 'Europe/Vienna',
    planTypeId: 'EU033U01D15V2',
    esims: Array.from({ length: qty }, (_, i) => makeEsim(i + 1)),
  }
}
