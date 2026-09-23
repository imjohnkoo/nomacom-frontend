/**
 * 사업자정보 — 모든 페이지 푸터 · /business · /checkout-preview 가 읽는 단일 출처 (K5 · spec D-11).
 * 법정 표시 9항목: 전자상거래법 제10조(사이버몰 운영자 표시) + K5 의 개인정보보호책임자.
 * 확정값은 사업자등록번호 · 고객센터 번호뿐이다.
 * 나머지는 P9-4 대기 — 추측으로 채우지 않는다.
 */
import { P9_4_PENDING, displayValue, isPending, type ContentValue } from './pending'

export interface BusinessInfo {
  /** 사용자에게 보이는 브랜드 */
  brandName: string
  /** 사업자등록증 상호 (개인사업자 — 한글 표기 확인 전) */
  companyName: ContentValue
  /** 대표자 성명 (한글 표기 확인 전) */
  representative: ContentValue
  businessRegistrationNumber: ContentValue
  /** 통신판매업 신고번호 (P9-4) */
  mailOrderSalesNumber: ContentValue
  /** 사업장 주소 (P9-4) */
  address: ContentValue
  /** 고객센터 유선전화 (휴대폰 불가 — PG 심사 요건) */
  phone: ContentValue
  email: ContentValue
  privacyOfficer: ContentValue
  /** 호스팅 서비스 제공자 — 인프라는 AWS(CloudFront · EC2) · 표기는 John 확인 */
  hostingProvider: ContentValue
}

export const BUSINESS_INFO: BusinessInfo = {
  brandName: '이심마니',
  companyName: P9_4_PENDING,
  representative: P9_4_PENDING,
  businessRegistrationNumber: '704-24-01747',
  mailOrderSalesNumber: P9_4_PENDING,
  address: P9_4_PENDING,
  phone: '070-8064-5232',
  email: P9_4_PENDING,
  privacyOfficer: P9_4_PENDING,
  hostingProvider: P9_4_PENDING,
}

export interface BusinessRow {
  key: keyof Omit<BusinessInfo, 'brandName'>
  label: string
  value: string
}

const ROW_ORDER: readonly Omit<BusinessRow, 'value'>[] = [
  { key: 'companyName', label: '상호' },
  { key: 'representative', label: '대표자' },
  { key: 'businessRegistrationNumber', label: '사업자등록번호' },
  { key: 'mailOrderSalesNumber', label: '통신판매업 신고번호' },
  { key: 'address', label: '사업장 주소' },
  { key: 'phone', label: '고객센터' },
  { key: 'email', label: '이메일' },
  { key: 'privacyOfficer', label: '개인정보보호책임자' },
  { key: 'hostingProvider', label: '호스팅 서비스 제공자' },
]

/** 푸터 · /business 표 — 9항목 고정 순서, 확정 전 값은 «(확정 전)» */
export function businessRows(info: BusinessInfo = BUSINESS_INFO): BusinessRow[] {
  return ROW_ORDER.map(({ key, label }) => ({ key, label, value: displayValue(info[key]) }))
}

/** 공정거래위원회 사업자정보 확인 — 통신판매업 신고번호가 확정돼야 연다 */
export function ftcBusinessCheckUrl(info: BusinessInfo = BUSINESS_INFO): string | null {
  const brn = info.businessRegistrationNumber
  const missing = (value: string) => isPending(value) || value.trim() === ''
  if (missing(info.mailOrderSalesNumber) || missing(brn)) return null
  return `https://www.ftc.go.kr/bizCommPop.do?wrkr_no=${brn.replace(/\D/g, '')}`
}
