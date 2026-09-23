/**
 * 상품 상세 문안(catalog spec S-4 · S-5 · F-7 · F-8). 2609 상세 문안에서 **문안만** 옮겨 웹 흐름에 맞게 고쳤다.
 * 카피 불변식: 사용일수 = 처음 연결된 때부터 24시간 단위(«자정» 금지) · 여러 나라 = 자동 전환(나라별 재개통 안내 금지)
 * · 소진 후 512kbps · «아이폰» · 환불은 «발급 전 전액» 만 · 근거 없는 최상급 금지. `product-detail.test.ts` 가 금지어를 막는다.
 */
import type { ZoneView } from '#shared/catalog/types'

export const SLOW_SPEED = '512kbps'
export const HERO_BADGES = ['테더링 가능', '당일 자동 발송'] as const

// ── 히어로 ──────────────────────────────────────────────────────────────

export function heroLead(zone: ZoneView): string {
  const n = zone.countries.length
  if (n === 1) return `${zone.label} 어디서나, 데이터 넉넉하게`
  if (n <= 4) return `${zone.countries.map((c) => c.nameKr).join(' · ')}, 한 번 설치로 ${n}개국`
  return zone.subtitle ? `${zone.subtitle}, 한 번 설치로 ${n}개국` : `한 번 설치로 ${n}개국`
}

/** «1~30일 · 60·90일» — 1부터 이어지는 일수는 범위로, 그 뒤는 나열 */
export function daysPhrase(days: number[]): string {
  const sorted = [...days].sort((a, b) => a - b)
  let end = 0
  while (sorted[end + 1] === sorted[end]! + 1) end += 1
  const head =
    sorted[0] === 1 && end > 0 ? `1~${sorted[end]}일` : sorted.slice(0, end + 1).join('·') + '일'
  const rest = sorted.slice(end + 1)
  return rest.length ? `${head} · ${rest.join('·')}일` : head
}

export function heroChecks(zone: ZoneView): string[] {
  const u = zone.products.find((p) => p.kind === 'U')
  const l = zone.products.find((p) => p.kind === 'L')
  const lines: string[] = []
  if (u) {
    const caps = [...new Set(u.options.map((o) => o.cap))].sort((a, b) => a - b)
    lines.push(`매일 ${caps.join('·')}GB, 다 쓰면 ${SLOW_SPEED} 로 계속`)
    lines.push(`${daysPhrase([...new Set(u.options.map((o) => o.days))])} 중에서 골라요`)
  } else if (l) {
    const caps = [...new Set(l.options.map((o) => o.cap))].sort((a, b) => a - b)
    lines.push(`30일 동안 총 ${caps[0]}~${caps[caps.length - 1]}GB 를 나눠 써요`)
  }
  lines.push('결제하면 카카오톡으로 1~2분 안에 발급 링크가 와요')
  return lines
}

// ── 선택기 ──────────────────────────────────────────────────────────────

export const PERIOD_HINT = {
  U: '1~30일은 하루 단위로, 그 밖에는 60일 · 90일을 고를 수 있어요.',
  L: '하루 한도가 없고, 다 쓰면 사용이 끝나요. 30일은 처음 연결된 때부터 24시간 단위로 세요.',
} as const

export function planTitle(kind: 'U' | 'L', cap: number): string {
  return kind === 'U' ? `매일 ${cap}GB` : `총 ${cap}GB`
}

export function planSub(kind: 'U' | 'L', unitWon: string): string {
  return kind === 'U'
    ? `다 쓰면 ${SLOW_SPEED} 로 계속 · 하루 약 ${unitWon}`
    : `30일 동안 나눠 쓰기 · 1GB당 약 ${unitWon}`
}

// ── 구매 시트(K2 — Proposal 원문 그대로) ──────────────────────────────────

export const PURCHASE_TITLE = '네이버 스마트스토어로 이동해요'
export const COUNTDOWN_SECONDS = 3

export function purchaseBody(optionName: string): string {
  return `결제사 도입 준비 중입니다. 네이버 스마트스토어에서 구매 가능합니다. 스토어에서 ‹${optionName}› 옵션을 골라 주세요`
}

export function countdownText(remaining: number): string {
  return remaining > 0 ? `${remaining}초 뒤에 이동해요` : '이동하고 있어요'
}

// ── 안내 섹션(D-4 — 용량 카드 아래 본문) ─────────────────────────────────

export const USAGE = {
  title: '사용일수는 이렇게 계산해요',
  lead: '현지에서 데이터가 처음 연결된 때부터 24시간마다 하루씩 줄어요.',
  timeline: [
    { date: '3월 1일', text: '오후 3시 연결' },
    { date: '3월 2일', text: '2일째' },
    { date: '3월 3일', text: '3일째' },
    { date: '3월 4일', text: '오후 3시 끝' },
  ],
  note: '예) 3일 상품을 3월 1일 오후 3시에 처음 연결한 경우. 발급할 때 넣는 개통 시작일은 안내용이고, 실제 차감은 현지에서 처음 연결될 때 시작돼요.',
} as const

export function coverageTitle(zone: ZoneView): string {
  const n = zone.countries.length
  return n === 1 ? `${zone.label} 전 지역에서 써요` : `${n}개국에서 하나의 eSIM 으로`
}

export function coverageLead(zone: ZoneView): string {
  return zone.countries.length === 1
    ? '폰이 알아서 현지 통신사에 연결해요.'
    : '나라를 옮겨도 같은 eSIM 을 그대로 써요. 폰이 알아서 그 나라 통신사로 바꿔요.'
}

export const OPERATOR_FALLBACK = '현지 대표 통신사'

export const HOW_TO = {
  title: '이렇게 써요',
  steps: [
    '네이버 스마트스토어에서 결제해요',
    '카카오톡으로 발급 링크를 받아요',
    '출국 전에 설치해 두고, 도착하면 이 회선을 켜요',
  ],
  note: '안심번호로는 발급 링크를 받을 수 없어요. 카카오톡을 받는 실제 번호로 주문해 주세요.',
  link: { to: '/guide', label: '설치 가이드 보기' },
} as const

export const DEVICES = {
  title: '내 폰에서 쓸 수 있나요?',
  text: 'eSIM 을 지원하는 아이폰 · 갤럭시에서 쓸 수 있어요.',
  link: { to: '/supported-devices', label: '지원 기기 확인' },
} as const

/** 환불 — «발급 전 전액» 만(Proposal A5 · shell 불변식). 수수료 · 발급 후 조건은 여기에 쓰지 않는다 */
export const REFUND = {
  title: '환불',
  text: '발급 전이면 전액 환불해 드려요.',
  link: { to: '/refund', label: '환불정책 보기' },
} as const

export interface FaqItem {
  q: string
  a: string
}

export function faqItems(zone: ZoneView, kind: 'U' | 'L'): FaqItem[] {
  const n = zone.countries.length
  const items: FaqItem[] = [
    {
      q: 'eSIM 은 언제 받을 수 있나요?',
      a: '결제하면 카카오톡으로 1~2분 안에 발급 링크가 와요. 야간 · 주말에도 자동으로 보내 드려요.',
    },
    kind === 'U'
      ? {
          q: '데이터는 언제 다시 채워지나요?',
          a: '처음 연결된 때부터 24시간마다 매일 한도가 새로 채워져요. 오후 3시에 처음 연결했다면 매일 오후 3시예요.',
        }
      : {
          q: '데이터는 매일 채워지나요?',
          a: '아니요. 30일 동안 총량을 나눠 써요. 30일은 처음 연결된 때부터 24시간 단위로 세요.',
        },
    {
      q: '설치는 언제 하면 되나요?',
      a: '발급받은 뒤 언제든 설치할 수 있어요. 출국 전에 미리 설치해 두고, 도착하면 이 회선을 켜세요.',
    },
    {
      q: '전화 · 문자도 되나요?',
      a: '데이터 전용이에요. 카카오톡 · 보이스톡 같은 인터넷 전화는 쓸 수 있어요.',
    },
    {
      q: '테더링도 되나요?',
      a: '네. 노트북 · 태블릿을 연결해서 쓸 수 있어요. 속도는 현지 통신 환경에 따라 조금 다를 수 있어요.',
    },
    kind === 'U'
      ? {
          q: '매일 데이터를 다 쓰면 어떻게 되나요?',
          a: `다음 24시간이 시작될 때까지 ${SLOW_SPEED} 로 계속 연결돼요.`,
        }
      : {
          q: '데이터를 다 쓰면 어떻게 되나요?',
          a: '30일 총량을 다 쓰면 사용이 끝나요. 더 필요하면 새 상품을 구매해 주세요.',
        },
    {
      q: 'QR 코드를 잃어버렸어요.',
      a: '주문번호로 본인 확인을 다시 하면 같은 QR 코드를 볼 수 있어요. eSIM 은 한 기기에만 등록되고, 등록한 뒤에는 다른 기기로 옮길 수 없어요.',
    },
  ]
  if (n > 1)
    items.push({
      q: '나라를 옮기면 다시 설정해야 하나요?',
      a: `아니요. 같은 eSIM 으로 ${n}개국에서 자동으로 연결돼요. 따로 할 일도, 재발급도 없어요.`,
    })
  return items
}
