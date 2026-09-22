import { describe, expect, it } from 'vitest'
import { BUSINESS_INFO, businessRows, ftcBusinessCheckUrl, type BusinessInfo } from './business'
import { P9_4_PENDING, PENDING_LABEL, displayValue, isPending } from './pending'
import { SMARTSTORE_URL, SUPPORT_CHANNELS, supportRows } from './support'

const FILLED: BusinessInfo = {
  brandName: '이심마니',
  companyName: '상호',
  representative: '대표',
  businessRegistrationNumber: '704-24-01747',
  mailOrderSalesNumber: '제0000-테스트-0000호',
  address: '주소',
  phone: '070-8064-5232',
  email: 'help@example.com',
  privacyOfficer: '책임자',
  hostingProvider: '호스팅',
}

describe('pending', () => {
  it('자리표시자는 «(확정 전)» 으로 보이고 확정값은 그대로', () => {
    expect(isPending(P9_4_PENDING)).toBe(true)
    expect(displayValue(P9_4_PENDING)).toBe(PENDING_LABEL)
    expect(displayValue('070-8064-5232')).toBe('070-8064-5232')
  })
})

describe('businessRows', () => {
  it('법정 9항목을 고정 순서로 (전자상거래법 제10조 + 개인정보보호책임자)', () => {
    expect(businessRows().map((row) => row.label)).toEqual([
      '상호',
      '대표자',
      '사업자등록번호',
      '통신판매업 신고번호',
      '사업장 주소',
      '고객센터',
      '이메일',
      '개인정보보호책임자',
      '호스팅 서비스 제공자',
    ])
  })

  it('조사로 확정된 값은 그대로 · 나머지는 «(확정 전)»', () => {
    const rows = Object.fromEntries(businessRows().map((row) => [row.key, row.value]))
    expect(rows.businessRegistrationNumber).toBe('704-24-01747')
    expect(rows.phone).toBe('070-8064-5232')
    expect(rows.companyName).toBe(PENDING_LABEL)
    expect(rows.mailOrderSalesNumber).toBe(PENDING_LABEL)
  })

  it('고객센터 번호는 휴대폰이 아니다 (PG 심사 — 유선전화 요건)', () => {
    expect(String(BUSINESS_INFO.phone)).not.toMatch(/^01[016789]/)
  })

  it('값이 채워지면 자리표시자가 남지 않는다', () => {
    expect(businessRows(FILLED).some((row) => row.value === PENDING_LABEL)).toBe(false)
  })
})

describe('ftcBusinessCheckUrl', () => {
  it('통신판매업 신고번호 확정 전에는 링크를 만들지 않는다', () => {
    expect(ftcBusinessCheckUrl()).toBeNull()
  })

  it('확정되면 사업자등록번호 숫자만으로 공정위 확인 링크', () => {
    expect(ftcBusinessCheckUrl(FILLED)).toBe(
      'https://www.ftc.go.kr/bizCommPop.do?wrkr_no=7042401747',
    )
  })
})

describe('supportRows', () => {
  const rows = Object.fromEntries(supportRows().map((row) => [row.key, row]))

  it('카카오톡 채널명은 @이심마니 — URL 확정 전에는 링크 없이 글자만', () => {
    expect(rows.kakao?.text).toBe('@이심마니')
    expect(rows.kakao?.href).toBeNull()
  })

  it('네이버 톡톡은 스토어로 · 전화는 사업자정보와 같은 번호로 tel 링크', () => {
    expect(rows.naver?.href).toBe(SMARTSTORE_URL)
    expect(rows.phone?.text).toBe(BUSINESS_INFO.phone)
    expect(rows.phone?.href).toBe('tel:070-8064-5232')
  })

  it('이메일 · 운영 시간은 확정 전 — 링크 없음', () => {
    expect(rows.email?.text).toBe(PENDING_LABEL)
    expect(rows.email?.href).toBeNull()
    expect(rows.hours?.text).toBe(PENDING_LABEL)
  })

  it('이메일이 확정되면 mailto 링크', () => {
    const [email] = supportRows([{ key: 'email', label: '이메일', value: 'help@example.com' }])
    expect(email?.href).toBe('mailto:help@example.com')
  })

  it('채널 5종', () => {
    expect(SUPPORT_CHANNELS.map((channel) => channel.key)).toEqual([
      'kakao',
      'naver',
      'phone',
      'email',
      'hours',
    ])
  })
})
