import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { formatWon } from './format'
import { countryPageData } from './pages'
import { parseCatalog } from './validate'

const catalog = parseCatalog(
  JSON.parse(
    readFileSync(new URL('../../server/data/catalog.fixture.json', import.meta.url), 'utf8'),
  ),
)

describe('formatWon', () => {
  it.each([
    [900, '900원'],
    [9100, '9,100원'],
    [113000, '113,000원'],
    [1234567, '1,234,567원'],
  ])('%d → %s', (n, s) => {
    expect(formatWon(n)).toBe(s)
  })
})

describe('countryPageData (catalog spec S-3 · E2E-12)', () => {
  it('체코 — 단일국 «체코» 먼저, 여러 나라 «유럽 34개국»', () => {
    const d = countryPageData(catalog, 'CZE')!
    expect(d.country).toEqual({ iso3: 'CZE', iso2: 'CZ', nameKr: '체코' })
    expect(d.single.map((c) => c.zone)).toEqual(['CZE00'])
    expect(d.multi.map((c) => c.zone)).toEqual(['EU340'])
    expect(d.single[0]).toMatchObject({
      to: '/products/cze00',
      label: '체코',
      sub: '프라하·체스키크룸로프 등 전지역',
      kinds: ['U', 'L'],
      lowestWon: 900,
      countryCount: 1,
      thumb: '/catalog/thumbs/CZE00U.webp',
    })
  })

  it('5개국 이상 zone 은 나라 나열 대신 썸네일 아랫줄', () => {
    const eu = countryPageData(catalog, 'FRA')!.multi.find((c) => c.zone === 'EU340')!
    expect(eu.sub).toBe('영국·스위스·튀르키예 포함')
    expect(eu.countryCount).toBe(34)
  })

  it('4개국 이하 zone 은 나라 이름을 « · » 로', () => {
    expect(countryPageData(catalog, 'CAN')!.multi[0]!.sub).toBe('미국 · 캐나다')
  })

  it('단일국 zone 이 없는 나라는 single 이 비어 있다(묶음 생략)', () => {
    const d = countryPageData(catalog, 'DEU')!
    expect(d.single).toEqual([])
    expect(d.multi.map((c) => c.zone)).toEqual(['EU340'])
  })

  it('판매하지 않는 나라 · 모르는 코드는 null(→ 404)', () => {
    expect(countryPageData(catalog, 'JPN')).toBeNull()
    expect(countryPageData(catalog, 'XXX')).toBeNull()
  })

  it('응답에 옵션 · 판매가가 없다(카드에 필요한 조각만)', () => {
    const json = JSON.stringify(countryPageData(catalog, 'FRA'))
    expect(json).not.toMatch(/options|salePrice|immediateDiscount|naverUrl/)
  })
})
