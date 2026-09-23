import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { optionLabel, zoneByCode } from '#shared/catalog/derive'
import { fixtureCatalog } from '#shared/catalog/test-data'
import type { Kind, ZoneView } from '#shared/catalog/types'
import * as copy from './product-detail'
import {
  REFUND,
  USAGE,
  daysPhrase,
  faqItems,
  heroChecks,
  heroLead,
  periodHint,
  purchaseBody,
} from './product-detail'

const catalog = fixtureCatalog()

/** 문자열 · 배열 · 객체 안의 글자를 전부 모은다(링크 경로는 문안이 아니라 뺀다) */
function strings(v: unknown): string[] {
  if (typeof v === 'string') return v.startsWith('/') ? [] : [v]
  if (Array.isArray(v)) return v.flatMap(strings)
  if (v && typeof v === 'object') return Object.values(v).flatMap(strings)
  return []
}

/** 내보낸 함수마다 부르는 법 — 새 함수를 내보내면 아래 «빠짐없이» 테스트가 여기 추가를 요구한다 */
const CALLS: Record<string, (zone: ZoneView, kind: Kind) => unknown> = {
  heroLead: (z, k) => heroLead(z, k),
  heroChecks: (z, k) => heroChecks(z, k),
  daysPhrase: (z, k) => daysPhrase(daysOf(z, k)),
  periodHint: (z, k) => periodHint(k, daysOf(z, k)),
  planTitle: (z, k) => capsOf(z, k).map((c) => copy.planTitle(k, c)),
  planSub: (_z, k) => copy.planSub(k, '1,300원'),
  purchaseBody: (z, k) => optionsOf(z, k).map((o) => purchaseBody(optionLabel(o))),
  countdownText: () => [3, 2, 1, 0].map(copy.countdownText),
  coverageTitle: (z) => copy.coverageTitle(z),
  coverageLead: (z) => copy.coverageLead(z),
  faqItems: (z, k) => faqItems(z, k),
}
const optionsOf = (z: ZoneView, k: Kind) => z.products.find((p) => p.kind === k)?.options ?? []
const capsOf = (z: ZoneView, k: Kind) => [...new Set(optionsOf(z, k).map((o) => o.cap))]
const daysOf = (z: ZoneView, k: Kind) => [...new Set(optionsOf(z, k).map((o) => o.days))]

/** 상세 화면에 나오는 문안 전부 — 상수 전부 + 함수 전부(zone × 종류) */
function allCopy(zone: ZoneView, kind: Kind): string {
  const constants = Object.values(copy).filter((v) => typeof v !== 'function')
  const calls = Object.values(CALLS).map((call) => call(zone, kind))
  return strings([...constants, ...calls]).join('\n')
}

/** 카탈로그 화면 .vue 의 <template> 원문(템플릿에 직접 쓴 문구 · 속성 포함) */
const VUE_FILES = [
  'app/components/catalog/ProductSections.vue',
  'app/components/catalog/PurchaseSheet.vue',
  'app/components/catalog/PlanCards.vue',
  'app/components/catalog/PeriodSelect.vue',
  'app/components/catalog/ZoneCard.vue',
  'app/components/catalog/ZoneMap.vue',
  'app/components/catalog/SearchField.vue',
  'app/pages/products/[zone].vue',
  'app/pages/countries/[iso3].vue',
  'app/pages/index.vue',
  'app/pages/search.vue',
]
const template = (file: string) => {
  const src = readFileSync(new URL(`../../${file}`, import.meta.url), 'utf8')
  const m = src.match(/<template>([\s\S]*)<\/template>/)
  if (!m) throw new Error(`${file}: <template> 가 없다`)
  return m[1]!.replace(/<!--[\s\S]*?-->/g, '')
}

const BANNED: [RegExp, string][] = [
  [/자정/, '사용일수는 첫 연결부터 24h rolling'],
  [/iPhone/i, '«아이폰»'],
  [/1~90일/, '판매는 1~30 · 60 · 90'],
  [/즉시할인|정가|할인율/, '최종가만(D-2)'],
  [/재개통|다시 개통|나라마다 (다시 )?설치/, '여러 나라 = 자동 전환'],
  [/최고|최저가 보장|유일|1위/, '근거 없는 최상급'],
  [/500\s?kbps|128\s?kbps/i, '소진 후 속도는 512kbps'],
  [/이어 쓰기|충전/, 'top-up 없음'],
]
/** 환불 영역 — «발급 전 전액» 만(A5) */
const REFUND_BANNED = /수수료|3,500|3500|반품|불가|발급 후|발급 뒤|공제|차감|청약철회/

const cases = catalog.zones.flatMap((z) => z.products.map((p) => [z.zone, p.kind] as const))

describe('상세 문안 불변식 (catalog spec 불변식 5 · F-7)', () => {
  it('내보낸 함수를 빠짐없이 검사한다(새 문안 함수는 CALLS 에 넣어야 통과)', () => {
    const fns = Object.entries(copy)
      .filter(([, v]) => typeof v === 'function')
      .map(([k]) => k)
      .sort()
    expect(fns).toEqual(Object.keys(CALLS).sort())
  })

  it.each(cases)('%s %s — 금지어 없음(상수 · 함수 전부)', (code, kind) => {
    const text = allCopy(zoneByCode(catalog, code)!, kind)
    for (const [re, why] of BANNED) expect(text.match(re)?.[0] ?? null, why).toBeNull()
  })

  it.each(VUE_FILES)('%s — 템플릿에 직접 쓴 문구에도 금지어 없음', (file) => {
    const text = template(file)
    for (const [re, why] of BANNED) expect(text.match(re)?.[0] ?? null, why).toBeNull()
  })

  it.each(cases.filter(([, k]) => k === 'L'))(
    '%s 종량제 — 무제한 문구(512kbps · 무제한 · 소진 후)가 없다',
    (code) => {
      const z = zoneByCode(catalog, code)!
      const text = strings([
        heroLead(z, 'L'),
        heroChecks(z, 'L'),
        periodHint('L', daysOf(z, 'L')),
        capsOf(z, 'L').map((c) => copy.planTitle('L', c)),
        copy.planSub('L', '2,200원'),
        faqItems(z, 'L'),
      ]).join('\n')
      expect(text).not.toMatch(/512kbps|무제한|소진\s?후/)
    },
  )

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
    // 환불 영역 전체 — 제목 · 본문 · 링크 문구 + 섹션 템플릿
    expect(strings(REFUND).join(' ')).not.toMatch(REFUND_BANNED)
    const section = template('app/components/catalog/ProductSections.vue').match(
      /<section[^>]*sec-refund[\s\S]*?<\/section>/,
    )?.[0]
    expect(section).toBeDefined()
    expect(section).not.toMatch(REFUND_BANNED)
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

describe('히어로 문구 (S-4 — 고른 종류를 따른다)', () => {
  it('단일국 · 4개국 이하 · 5개국 이상', () => {
    expect(heroLead(zoneByCode(catalog, 'CZE00')!, 'U')).toBe('체코 어디서나, 데이터 넉넉하게')
    expect(heroLead(zoneByCode(catalog, 'CZE00')!, 'L')).toBe(
      '체코 어디서나, 필요한 만큼 나눠 써요',
    )
    expect(heroLead(zoneByCode(catalog, 'NA022')!, 'U')).toBe('미국 · 캐나다, 한 번 설치로 2개국')
    expect(heroLead(zoneByCode(catalog, 'EU340')!, 'U')).toBe(
      '영국·스위스·튀르키예 포함, 한 번 설치로 34개국',
    )
  })

  it('무제한 체크 3줄 — 용량 · 기간 · 발급', () => {
    expect(heroChecks(zoneByCode(catalog, 'CZE00')!, 'U')).toEqual([
      '매일 1·2·3GB, 다 쓰면 512kbps 로 계속',
      '1~30일 · 60·90일 중에서 골라요',
      '결제하면 카카오톡으로 1~2분 안에 발급 링크가 와요',
    ])
  })

  it('종량제 체크 3줄 — 총량 · 하루 한도 없음 · 발급(무제한 문구 없음)', () => {
    expect(heroChecks(zoneByCode(catalog, 'CZE00')!, 'L')).toEqual([
      '30일 동안 총 1~30GB 를 나눠 써요',
      '하루 한도가 없고 다 쓰면 끝나요',
      '결제하면 카카오톡으로 1~2분 안에 발급 링크가 와요',
    ])
  })

  it('종량제 용량이 하나면 범위로 쓰지 않는다(«총 5~5GB» 금지)', () => {
    const cze = structuredClone(zoneByCode(catalog, 'CZE00')!)
    const l = cze.products.find((p) => p.kind === 'L')!
    l.options = l.options.filter((o) => o.cap === 5)
    expect(heroChecks(cze, 'L')[0]).toBe('30일 동안 총 5GB 를 나눠 써요')
  })

  it('기간 안내는 실제 일수로 — 60 · 90일이 없으면 약속하지 않는다', () => {
    const all = [...Array.from({ length: 30 }, (_, i) => i + 1), 60, 90]
    expect(periodHint('U', all)).toBe(
      '1~30일은 하루 단위로, 그 밖에는 60일 · 90일을 고를 수 있어요.',
    )
    expect(
      periodHint(
        'U',
        all.filter((d) => d !== 90),
      ),
    ).toBe('1~30일은 하루 단위로, 그 밖에는 60일을 고를 수 있어요.')
    expect(periodHint('U', all.slice(0, 30))).toBe('1~30일 중 하루 단위로 고를 수 있어요.')
    expect(periodHint('L', [30])).toContain('처음 연결된 때부터 24시간 단위')
  })

  it('사용일수 예시는 모든 점에 시각이 있다(날짜만이면 자정으로 읽힌다)', () => {
    for (const t of USAGE.timeline) expect(t.text).toMatch(/오후 3시/)
    expect(USAGE.note).toContain('시작 날짜') // 발급 화면 이름과 같은 말
  })

  it('기간 문구', () => {
    expect(daysPhrase([...Array.from({ length: 30 }, (_, i) => i + 1), 60, 90])).toBe(
      '1~30일 · 60·90일',
    )
    expect(daysPhrase([30])).toBe('30일')
    expect(daysPhrase([1, 2, 3])).toBe('1~3일')
  })
})
