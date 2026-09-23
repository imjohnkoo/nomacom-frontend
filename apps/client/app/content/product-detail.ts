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
