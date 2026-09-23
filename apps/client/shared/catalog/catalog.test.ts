import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  capsOf,
  countriesOf,
  daysOf,
  defaultSelection,
  kindsOf,
  lowestWon,
  optionFor,
  optionLabel,
  perDayWon,
  perGbWon,
  zoneByCode,
  zonesOfCountry,
} from './derive'
import { CatalogValidationError, expectedNaverUrl, parseCatalog } from './validate'

// 표본 픽스처 = 스냅샷 2026-09-22 추출(5 zone · 7 SKU). 아래 가격 기대값은 그 스냅샷 값이다.
const FIXTURE = JSON.parse(
  readFileSync(new URL('../../server/data/catalog.fixture.json', import.meta.url), 'utf8'),
)
const fresh = () => structuredClone(FIXTURE)
const zoneRaw = (raw: any, code: string) => raw.zones.find((z: any) => z.zone === code)
const productRaw = (raw: any, sku: string) =>
  raw.zones.flatMap((z: any) => z.products).find((p: any) => p.sku === sku)

describe('parseCatalog — 표본 픽스처', () => {
  const cat = parseCatalog(fresh())

  it('5 zone 을 읽고 픽스처임을 표시한다', () => {
    expect(cat.zones.map((z) => z.zone)).toEqual(['CZE00', 'FRA00', 'EU340', 'NA022', 'THA00'])
    expect(cat.fixture).toBe(true)
  })

  it('무제한이 먼저, 옵션은 용량 · 일수 오름차순', () => {
    const cze = zoneByCode(cat, 'CZE00')!
    expect(kindsOf(cze)).toEqual(['U', 'L'])
    const days = cze.products[0]!.options.map((o) => `${o.cap}/${o.days}`)
    expect(days.slice(0, 3)).toEqual(['1/1', '1/2', '1/3'])
  })

  it('화면 모델에 판매가 · 즉시할인 · 판매 상태 · usable 이 남지 않는다(최종가만 — D-2)', () => {
    const json = JSON.stringify(cat)
    for (const key of [
      'salePriceWon',
      'immediateDiscountWon',
      'saleStatus',
      'displayStatus',
      'usable',
      'naverName',
    ])
      expect(json).not.toContain(`"${key}"`)
  })

  it('이미지 경로에 네이버 CDN 이 없다', () => {
    expect(JSON.stringify(cat)).not.toMatch(/pstatic|shop-phinf/)
  })
})

describe('parseCatalog — 깨진 입력은 빌드를 멈춘다', () => {
  const cases: [string, (raw: any) => void, RegExp][] = [
    ['판매중지 상품', (r) => (productRaw(r, 'FRA00U').saleStatus = 'SUSPENSION'), /SALE\/ON/],
    ['미전시 상품', (r) => (productRaw(r, 'FRA00U').displayStatus = 'SUSPENSION'), /SALE\/ON/],
    ['판매 불가 옵션', (r) => (productRaw(r, 'FRA00U').options[3].usable = false), /usable/],
    ['usable 없음', (r) => delete productRaw(r, 'FRA00U').options[3].usable, /usable/],
    ['최종가 0', (r) => (productRaw(r, 'CZE00U').options[0].finalWon = 0), /최종가/],
    [
      '같은 칸 중복',
      (r) => productRaw(r, 'CZE00U').options.push({ ...productRaw(r, 'CZE00U').options[0] }),
      /중복/,
    ],
    [
      '무제한 1~30일 빈칸',
      (r) => {
        const p = productRaw(r, 'CZE00U')
        p.options = p.options.filter((o: any) => !(o.cap === 2 && o.days === 13))
      },
      /매일 2GB 에 13일이 없다/,
    ],
    ['상품 0 zone', (r) => (zoneRaw(r, 'THA00').products = []), /상품이 없다/],
    [
      '네이버 CDN 썸네일',
      (r) => (productRaw(r, 'THA00U').images.thumb = 'https://shop-phinf.pstatic.net/a.png'),
      /네이버 CDN/,
    ],
    ['지도 경로 밖', (r) => (zoneRaw(r, 'THA00').map.svg = '/maps/THA00.svg'), /\/catalog\/maps\//],
    ['종량제 29일', (r) => (productRaw(r, 'CZE00L').options[0].days = 29), /30일이 아니다/],
    ['zone 라벨 없음', (r) => (zoneRaw(r, 'FRA00').nameKr = ''), /nameKr/],
    ['iso2 없음', (r) => delete zoneRaw(r, 'FRA00').countries[0].iso2, /iso2/],
    [
      'naverUrl 에 옵션 파라미터',
      (r) => (productRaw(r, 'FRA00U').naverUrl += '&option=1'),
      /K2 모양/,
    ],
    ['SKU 가 zone 과 다름', (r) => (productRaw(r, 'FRA00U').sku = 'FRA01U'), /zone\+kind/],
    ['kind 가 U · L 이 아님', (r) => (productRaw(r, 'FRA00U').kind = 'X'), /U · L/],
    ['zones 없음', (r) => delete r.zones, /zones/],
  ]

  it.each(cases)('%s', (_name, mutate, pattern) => {
    const raw = fresh()
    mutate(raw)
    expect(() => parseCatalog(raw)).toThrow(CatalogValidationError)
    try {
      parseCatalog(raw)
    } catch (e) {
      expect((e as CatalogValidationError).issues.join('\n')).toMatch(pattern)
    }
  })
})

describe('파생값', () => {
  const cat = parseCatalog(fresh())
  const cze = zoneByCode(cat, 'CZE00')!

  it('optionFor — 체코 매일 2GB · 7일 = 9,100원(CZE00U02D07V2)', () => {
    const o = optionFor(cze, 'U', 2, 7)!
    expect(o.code).toBe('CZE00U02D07V2')
    expect(o.finalWon).toBe(9100)
    expect(optionFor(cze, 'U', 2, 31)).toBeUndefined()
  })

  it('보조 단가는 내림 — 하루 약 1,300원 · 1GB당 약 2,200원', () => {
    expect(perDayWon(optionFor(cze, 'U', 2, 7)!)).toBe(1300)
    expect(perDayWon(optionFor(cze, 'U', 3, 7)!)).toBe(1814) // 12,700 / 7 = 1,814.28…
    expect(perGbWon(optionFor(cze, 'L', 10, 30)!)).toBe(2200)
  })

  it('용량은 큰 것부터, 기간은 1~30 · 60 · 90 오름차순', () => {
    expect(capsOf(cze.products[0]!)).toEqual([3, 2, 1])
    expect(capsOf(cze.products[1]!)).toEqual([30, 20, 10, 7, 5, 3, 1])
    const days = daysOf(cze.products[0]!)
    expect(days).toHaveLength(32)
    expect(days.slice(-3)).toEqual([30, 60, 90])
  })

  it('옵션명은 스토어 두 칸을 « · » 로 잇는다', () => {
    expect(optionLabel(optionFor(cze, 'U', 2, 7)!)).toBe('매일 2GB + 소진후 512kbps 무제한 · 7일')
  })

  it('기본 선택 = 무제한 · 매일 1GB · 7일 (D-16)', () => {
    expect(defaultSelection(cze)).toEqual({ kind: 'U', cap: 1, days: 7 })
  })

  it('최저가 — 태국 700원 · 유럽 34개국 1,300원(무제한 1일 1GB)', () => {
    expect(lowestWon(zoneByCode(cat, 'THA00')!)).toBe(700)
    expect(lowestWon(zoneByCode(cat, 'EU340')!)).toBe(1300)
  })

  it('나라가 들어간 zone — 단일국 먼저 · 국가 수 오름차순 (D-11)', () => {
    expect(zonesOfCountry(cat, 'CZE').map((z) => z.zone)).toEqual(['CZE00', 'EU340'])
    expect(zonesOfCountry(cat, 'CAN').map((z) => z.zone)).toEqual(['NA022'])
    expect(zonesOfCountry(cat, 'JPN')).toEqual([])
  })

  it('판매 중인 나라 = zone 나라의 합집합(중복 없음)', () => {
    const iso = countriesOf(cat).map((c) => c.iso3)
    expect(new Set(iso).size).toBe(iso.length)
    expect(iso).toHaveLength(37) // EU340 34(체코 · 프랑스 포함) + 미국 · 캐나다 + 태국
  })

  it('K2 이동 링크 모양', () => {
    expect(expectedNaverUrl(9382876791, 'CZE00U')).toBe(
      'https://smartstore.naver.com/esimmany/products/9382876791?nt_source=esimmany-web&nt_medium=detail&nt_detail=CZE00U',
    )
    expect(cze.products[0]!.naverUrl).toBe(expectedNaverUrl(9382876791, 'CZE00U'))
  })
})
