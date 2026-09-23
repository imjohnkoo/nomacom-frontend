import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { zoneByCode } from '#shared/catalog/derive'
import type { Kind, ZoneView } from '#shared/catalog/types'
import { parseCatalog } from '#shared/catalog/validate'
import {
  DEVICES,
  HOW_TO,
  PERIOD_HINT,
  REFUND,
  USAGE,
  countdownText,
  coverageLead,
  coverageTitle,
  daysPhrase,
  faqItems,
  heroChecks,
  heroLead,
  planSub,
  planTitle,
  purchaseBody,
} from './product-detail'

const catalog = parseCatalog(
  JSON.parse(
    readFileSync(new URL('../../server/data/catalog.fixture.json', import.meta.url), 'utf8'),
  ),
)

/** 상세 화면에 나오는 모든 문장 — zone × 종류 */
function allCopy(zone: ZoneView, kind: Kind): string {
  return [
    heroLead(zone),
    ...heroChecks(zone),
    PERIOD_HINT[kind],
    planTitle(kind, 2),
    planSub(kind, '1,300원'),
    USAGE.title,
    USAGE.lead,
    USAGE.note,
    ...USAGE.timeline.map((t) => `${t.date} ${t.text}`),
    coverageTitle(zone),
    coverageLead(zone),
    HOW_TO.title,
    ...HOW_TO.steps,
    HOW_TO.note,
    DEVICES.text,
    REFUND.text,
    ...faqItems(zone, kind).flatMap((f) => [f.q, f.a]),
    purchaseBody('매일 2GB + 소진후 512kbps 무제한 · 7일'),
    countdownText(3),
  ].join('\n')
}

const cases = catalog.zones.flatMap((z) => z.products.map((p) => [z.zone, p.kind] as const))

describe('상세 문안 불변식 (catalog spec 불변식 5 · F-7)', () => {
  it.each(cases)('%s %s — 금지어 없음', (code, kind) => {
    const text = allCopy(zoneByCode(catalog, code)!, kind)
    expect(text).not.toMatch(/자정/) // 사용일수는 첫 연결부터 24h rolling
    expect(text).not.toMatch(/iPhone/i) // «아이폰»
    expect(text).not.toMatch(/1~90일/) // 판매는 1~30 · 60 · 90
    expect(text).not.toMatch(/즉시할인|정가|할인율/) // 최종가만(D-2)
    expect(text).not.toMatch(/재개통|다시 개통|나라마다 (다시 )?설치/) // 여러 나라 = 자동 전환
    expect(text).not.toMatch(/최고|최저가 보장|유일|1위/) // 근거 없는 최상급
    expect(text).not.toMatch(/500\s?kbps|128\s?kbps/i) // 소진 후 속도는 512kbps
    expect(text).not.toMatch(/이어 쓰기|충전/) // top-up 없음
  })

  it('환불은 «발급 전 전액» 만 — 수수료 · 발급 후 조건 없음(A5)', () => {
    for (const code of catalog.zones.map((z) => z.zone)) {
      for (const kind of ['U', 'L'] as const) {
        const faq = faqItems(zoneByCode(catalog, code)!, kind)
          .map((f) => `${f.q} ${f.a}`)
          .join(' ')
        expect(faq).not.toMatch(/환불|반품|수수료|3,500/)
      }
    }
    expect(REFUND.text).toBe('발급 전이면 전액 환불해 드려요.')
    expect(REFUND.text).not.toMatch(/수수료|3,500|반품|불가|발급 후/)
  })

  it('여러 나라 zone 은 자동 전환 FAQ 가 있고, 단일국에는 없다', () => {
    const eu = faqItems(zoneByCode(catalog, 'EU340')!, 'U').at(-1)!
    expect(eu.a).toContain('34개국에서 자동으로 연결돼요')
    expect(eu.a).toContain('재발급도 없어요')
    expect(
      faqItems(zoneByCode(catalog, 'CZE00')!, 'U').some((f) => f.q.includes('나라를 옮기면')),
    ).toBe(false)
  })

  it('무제한은 512kbps, 종량제는 «사용이 끝나요»', () => {
    const cze = zoneByCode(catalog, 'CZE00')!
    expect(allCopy(cze, 'U')).toContain('512kbps')
    expect(
      faqItems(cze, 'L')
        .map((f) => f.a)
        .join(' '),
    ).toContain('사용이 끝나요')
  })

  it('사용일수 설명은 «처음 연결된 때부터 24시간»', () => {
    expect(USAGE.lead).toContain('처음 연결된 때부터 24시간')
  })

  it('K2 구매 문구는 Proposal 원문 그대로', () => {
    expect(purchaseBody('매일 2GB + 소진후 512kbps 무제한 · 7일')).toBe(
      '결제사 도입 준비 중입니다. 네이버 스마트스토어에서 구매 가능합니다. 스토어에서 ‹매일 2GB + 소진후 512kbps 무제한 · 7일› 옵션을 골라 주세요',
    )
  })
})

describe('히어로 문구', () => {
  it('단일국 · 4개국 이하 · 5개국 이상', () => {
    expect(heroLead(zoneByCode(catalog, 'CZE00')!)).toBe('체코 어디서나, 데이터 넉넉하게')
    expect(heroLead(zoneByCode(catalog, 'NA022')!)).toBe('미국 · 캐나다, 한 번 설치로 2개국')
    expect(heroLead(zoneByCode(catalog, 'EU340')!)).toBe(
      '영국·스위스·튀르키예 포함, 한 번 설치로 34개국',
    )
  })

  it('무제한 체크 줄 — 용량 · 기간 · 발급', () => {
    expect(heroChecks(zoneByCode(catalog, 'CZE00')!)).toEqual([
      '매일 1·2·3GB, 다 쓰면 512kbps 로 계속',
      '1~30일 · 60·90일 중에서 골라요',
      '결제하면 카카오톡으로 1~2분 안에 발급 링크가 와요',
    ])
  })

  it('기간 문구', () => {
    expect(daysPhrase([...Array.from({ length: 30 }, (_, i) => i + 1), 60, 90])).toBe(
      '1~30일 · 60·90일',
    )
    expect(daysPhrase([30])).toBe('30일')
    expect(daysPhrase([1, 2, 3])).toBe('1~3일')
  })
})
