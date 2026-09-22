/**
 * 고객센터 채널 — 마이(/my#cs) · 환불정책의 신청 경로가 읽는다.
 * 확정: 카카오톡 채널명 «@이심마니»(스토어 고시 · 2609 상세 · 설치가이드) · 네이버 톡톡(스토어) · 전화(사업자정보와 같은 값).
 * 대기(P9-4): 카카오 채널 URL · 이메일 · 운영 시간.
 */
import { BUSINESS_INFO } from './business'
import { P9_4_PENDING, displayValue, isPending, type ContentValue } from './pending'

export interface SupportChannel {
  key: 'kakao' | 'naver' | 'phone' | 'email' | 'hours'
  label: string
  value: ContentValue
  /** 링크 — 확정 전이거나 없으면 글자만 보인다 */
  href?: ContentValue
}

export const SMARTSTORE_URL = 'https://smartstore.naver.com/esimmany'

export const SUPPORT_CHANNELS: readonly SupportChannel[] = [
  { key: 'kakao', label: '카카오톡 채널', value: '@이심마니', href: P9_4_PENDING },
  { key: 'naver', label: '네이버 톡톡', value: '스마트스토어 채팅 문의', href: SMARTSTORE_URL },
  {
    key: 'phone',
    label: '전화',
    value: BUSINESS_INFO.phone,
    href: isPending(BUSINESS_INFO.phone) ? undefined : `tel:${BUSINESS_INFO.phone}`,
  },
  { key: 'email', label: '이메일', value: BUSINESS_INFO.email },
  { key: 'hours', label: '운영 시간', value: P9_4_PENDING },
]

export interface SupportRow {
  key: SupportChannel['key']
  label: string
  text: string
  href: string | null
}

/** 화면용 — 확정 전 값은 «(확정 전)», 링크는 확정된 것만 */
export function supportRows(channels: readonly SupportChannel[] = SUPPORT_CHANNELS): SupportRow[] {
  return channels.map((channel) => {
    const linkable = !isPending(channel.value) && channel.href && !isPending(channel.href)
    const href =
      channel.key === 'email' && !isPending(channel.value) ? `mailto:${channel.value}` : null
    return {
      key: channel.key,
      label: channel.label,
      text: displayValue(channel.value),
      href: linkable ? (channel.href as string) : href,
    }
  })
}
