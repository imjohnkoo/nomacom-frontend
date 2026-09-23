import { describe, expect, it } from 'vitest'
import { BUSINESS_INFO, businessRows, ftcBusinessCheckUrl, type BusinessInfo } from './business'
import { P9_4_PENDING, PENDING_LABEL, displayValue, isPending } from './pending'
import { SMARTSTORE_URL, SUPPORT_CHANNELS, supportRows, type SupportChannel } from './support'

// 테스트는 «지금 무엇이 대기 중인가» 가 아니라 동작을 본다 — P9-4 문안이 채워져도 깨지지 않게 픽스처로.
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

const PENDING_INFO: BusinessInfo = {
  ...FILLED,
  companyName: P9_4_PENDING,
  mailOrderSalesNumber: P9_4_PENDING,
  email: P9_4_PENDING,
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

  it('조사로 확정된 사업자등록번호 · 고객센터 번호', () => {
    const rows = Object.fromEntries(businessRows().map((row) => [row.key, row.value]))
    expect(rows.businessRegistrationNumber).toBe('704-24-01747')
    expect(rows.phone).toBe('070-8064-5232')
  })

  it('확정 전 값만 «(확정 전)»', () => {
    const rows = Object.fromEntries(businessRows(PENDING_INFO).map((row) => [row.key, row.value]))
    expect(rows.companyName).toBe(PENDING_LABEL)
    expect(rows.email).toBe(PENDING_LABEL)
    expect(rows.representative).toBe('대표')
  })

  it('라벨과 값이 짝으로 맞다 (행 순서만이 아니라 key ↔ 라벨)', () => {
    expect(businessRows(FILLED).map((row) => [row.label, row.value])).toEqual([
      ['상호', '상호'],
      ['대표자', '대표'],
      ['사업자등록번호', '704-24-01747'],
      ['통신판매업 신고번호', '제0000-테스트-0000호'],
      ['사업장 주소', '주소'],
      ['고객센터', '070-8064-5232'],
      ['이메일', 'help@example.com'],
      ['개인정보보호책임자', '책임자'],
      ['호스팅 서비스 제공자', '호스팅'],
    ])
  })

  it('값이 채워지면 자리표시자가 남지 않는다', () => {
    expect(businessRows(FILLED).some((row) => row.value === PENDING_LABEL)).toBe(false)
  })

  it('고객센터 번호는 휴대폰이 아니다 (PG 심사 — 유선전화 요건)', () => {
    expect(String(BUSINESS_INFO.phone)).not.toMatch(/^01[016789]/)
  })
})

describe('ftcBusinessCheckUrl', () => {
  it('통신판매업 신고번호 확정 전에는 링크를 만들지 않는다', () => {
    expect(ftcBusinessCheckUrl(PENDING_INFO)).toBeNull()
  })

  it('빈 값(공백)도 확정이 아니다 — 링크를 만들지 않는다', () => {
    expect(ftcBusinessCheckUrl({ ...FILLED, mailOrderSalesNumber: '' })).toBeNull()
    expect(ftcBusinessCheckUrl({ ...FILLED, businessRegistrationNumber: '  ' })).toBeNull()
  })

  it('사업자등록번호가 확정 전이어도 링크를 만들지 않는다 (신고번호만 확정된 경우)', () => {
    expect(ftcBusinessCheckUrl({ ...FILLED, businessRegistrationNumber: P9_4_PENDING })).toBeNull()
  })

  it('확정되면 사업자등록번호 숫자만으로 공정위 확인 링크', () => {
    expect(ftcBusinessCheckUrl(FILLED)).toBe(
      'https://www.ftc.go.kr/bizCommPop.do?wrkr_no=7042401747',
    )
  })
})

describe('supportRows', () => {
  it('카카오톡 채널명은 @이심마니 · 네이버 톡톡은 스토어로 · 전화는 사업자정보 번호의 tel 링크', () => {
    const rows = Object.fromEntries(supportRows().map((row) => [row.key, row]))
    expect(rows.kakao?.text).toBe('@이심마니')
    expect(rows.naver?.href).toBe(SMARTSTORE_URL)
    expect(rows.phone?.text).toBe(BUSINESS_INFO.phone)
    expect(rows.phone?.href).toBe('tel:070-8064-5232')
  })

  it('값 · 링크가 확정 전이면 글자만 (링크 없음)', () => {
    const channels: SupportChannel[] = [
      { key: 'kakao', label: '카카오톡 채널', value: '@이심마니', href: P9_4_PENDING },
      { key: 'email', label: '이메일', value: P9_4_PENDING },
      { key: 'hours', label: '운영 시간', value: P9_4_PENDING },
    ]
    const [kakao, email, hours] = supportRows(channels)
    expect(kakao).toMatchObject({ text: '@이심마니', href: null })
    expect(email).toMatchObject({ text: PENDING_LABEL, href: null })
    expect(hours).toMatchObject({ text: PENDING_LABEL, href: null })
  })

  it('확정되면 링크 — 이메일은 mailto', () => {
    const [kakao, email] = supportRows([
      { key: 'kakao', label: '카카오톡 채널', value: '@이심마니', href: 'https://pf.kakao.com/_x' },
      { key: 'email', label: '이메일', value: 'help@example.com' },
    ])
    expect(kakao?.href).toBe('https://pf.kakao.com/_x')
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

describe('실제 콘텐츠 값 (머지 게이트가 못 보는 빈 값 차단)', () => {
  // 게이트는 P9_4_PENDING 글자만 찾는다 — '' 로 채워 게이트를 통과시키면 푸터에 빈 칸이 prod 로 나간다.
  // 값이 무엇인지가 아니라 «대기이거나 비어 있지 않다» 만 본다 — P9-4 반영 때 깨지지 않는다.
  const filled = (value: unknown) =>
    isPending(value) || (typeof value === 'string' && value.trim().length > 0)

  it('사업자정보 모든 항목', () => {
    for (const [key, value] of Object.entries(BUSINESS_INFO))
      expect([key, filled(value)]).toEqual([key, true])
  })

  it('고객센터 채널 값 · 링크', () => {
    for (const channel of SUPPORT_CHANNELS) {
      expect([channel.key, filled(channel.value)]).toEqual([channel.key, true])
      if (channel.href !== undefined)
        expect([channel.key, filled(channel.href)]).toEqual([channel.key, true])
    }
  })
})
