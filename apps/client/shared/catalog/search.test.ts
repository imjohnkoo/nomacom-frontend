import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { COUNTRY_ALIASES } from '~/content/catalog-search'
import { POPULAR_COUNTRIES, POPULAR_MULTI_ZONES } from '~/content/popular'
import { resolveHome } from './home'
import { buildSearchIndex, searchCountries, toChosung, type UpcomingCountry } from './search'
import { parseCatalog } from './validate'

const APP = new URL('../../', import.meta.url)
const catalog = parseCatalog(
  JSON.parse(readFileSync(new URL('server/data/catalog.fixture.json', APP), 'utf8')),
)
const upcoming = JSON.parse(readFileSync(new URL('app/content/catalog-upcoming.json', APP), 'utf8'))
  .countries as UpcomingCountry[]
const en = new Intl.DisplayNames('en', { type: 'region' })
const index = buildSearchIndex(catalog, upcoming, COUNTRY_ALIASES, (iso2) => en.of(iso2) ?? iso2)
const first = (q: string) => searchCountries(index, q)[0]
const isoOf = (q: string) => searchCountries(index, q).map((h) => h.entry.iso3)

describe('검색 색인', () => {
  it('판매 나라 + 준비 중 7개국, 가나다순, 중복 없음', () => {
    const iso = index.map((e) => e.iso3)
    expect(new Set(iso).size).toBe(iso.length)
    expect(
      index
        .filter((e) => e.upcoming)
        .map((e) => e.iso3)
        .sort(),
    ).toEqual(['CHN', 'JPN', 'KHM', 'LAO', 'MYS', 'PHL', 'TWN'].sort())
    expect(index.map((e) => e.ko)).toEqual(
      [...index.map((e) => e.ko)].sort((a, b) => a.localeCompare(b, 'ko')),
    )
  })

  it('zoneCount = 그 나라가 들어간 zone 수 · 준비 중은 0', () => {
    expect(index.find((e) => e.iso3 === 'CZE')!.zoneCount).toBe(2) // CZE00 · EU340
    expect(index.find((e) => e.iso3 === 'JPN')!.zoneCount).toBe(0)
  })
})

describe('searchCountries (spec E2E-11)', () => {
  it('초성 변환', () => {
    expect(toChosung('프랑스')).toBe('ㅍㄹㅅ')
    expect(toChosung('eSIM 체코')).toBe('eSIM ㅊㅋ')
  })

  it('«파리» → 프랑스(도시)', () => {
    const hit = first('파리')!
    expect(hit.entry.iso3).toBe('FRA')
    expect(hit).toMatchObject({ via: 'city', city: '파리' })
  })

  it('«ㅍㄹ» → 포르투갈 · 폴란드 · 프랑스 · 핀란드 · 필리핀(준비 중) — 초성 앞부분 · 가나다', () => {
    // 앞부분 일치 다음에 부분 일치(키프로스 ㅋㅍㄹㅅ)
    expect(isoOf('ㅍㄹ')).toEqual(['PRT', 'POL', 'FRA', 'FIN', 'PHL', 'CYP'])
    expect(searchCountries(index, 'ㅍㄹ').every((h) => h.via === 'chosung')).toBe(true)
  })

  it('«France» · «fra» · «fr» → 프랑스(영문 · ISO)', () => {
    expect(first('France')!.entry.iso3).toBe('FRA')
    expect(first('fra')!.entry.iso3).toBe('FRA')
    expect(first('FR')!.entry.iso3).toBe('FRA')
  })

  it('«터키» → 튀르키예(별칭)', () => {
    expect(first('터키')).toMatchObject({ entry: { iso3: 'TUR' }, via: 'alias' })
  })

  it('«일본» → 준비 중(링크 없음 표시용)', () => {
    expect(first('일본')!.entry).toMatchObject({ iso3: 'JPN', upcoming: true, zoneCount: 0 })
  })

  it('«몰디브» · 빈 입력 · 공백 → 결과 없음', () => {
    expect(searchCountries(index, '몰디브')).toEqual([])
    expect(searchCountries(index, '')).toEqual([])
    expect(searchCountries(index, '   ')).toEqual([])
  })

  it('이름 앞부분 일치가 부분 일치보다 먼저(«스» → 스웨덴 · 스위스 · 스페인 … 뒤에 그리스 · 프랑스)', () => {
    const iso = isoOf('스')
    const lastPrefix = Math.max(...['SWE', 'CHE', 'ESP'].map((i) => iso.indexOf(i)))
    expect(lastPrefix).toBeLessThan(iso.indexOf('GRC'))
    expect(lastPrefix).toBeLessThan(iso.indexOf('FRA'))
  })

  it('한 글자는 이름 · 초성만 — 도시 · 별칭은 두 글자부터', () => {
    expect(searchCountries(index, '스').every((h) => h.via === 'name')).toBe(true)
    expect(isoOf('바르')).toEqual(['ESP', 'POL']) // 바르셀로나 · 바르샤바 — 가나다
    expect(first('바르샤')).toMatchObject({ entry: { iso3: 'POL' }, via: 'city', city: '바르샤바' })
  })

  it('띄어쓰기 · 대소문자는 무시한다', () => {
    expect(first(' 체 코 ')!.entry.iso3).toBe('CZE')
    expect(first('CZECHIA')!.entry.iso3).toBe('CZE')
  })
})

describe('홈 격자 (spec D-5)', () => {
  const home = resolveHome(catalog, POPULAR_COUNTRIES, POPULAR_MULTI_ZONES)

  it('칸은 국가 페이지 · 상품 상세로 가고, 라벨은 «무제한»(가격 없음)', () => {
    expect(home.popular.map((t) => t.to)).toContain('/countries/fra')
    expect(home.multi.map((t) => t.to)).toContain('/products/eu340')
    for (const t of [...home.popular, ...home.multi]) {
      expect(t.badge).toBe('무제한')
      expect(JSON.stringify(t)).not.toMatch(/원/)
    }
    expect(home.multi.find((t) => t.to === '/products/eu340')!.iso2s).toHaveLength(3)
  })

  it('실 카탈로그에서는 목록의 모든 코드가 있어야 한다(표본 픽스처는 없는 것을 건너뛴다)', () => {
    if (catalog.fixture) {
      expect(home.popular.map((t) => t.label)).toEqual(['프랑스', '태국'])
      expect(home.missing.length).toBeGreaterThan(0)
    } else {
      expect(home.missing).toEqual([])
    }
  })

  it('다국가 목록에 단일국 zone 을 넣으면 missing 으로 잡는다', () => {
    expect(resolveHome(catalog, [], ['CZE00']).missing).toEqual([
      '다국가 CZE00(여러 나라 zone 없음)',
    ])
    expect(resolveHome(catalog, ['EU3'], []).missing[0]).toMatch(/단일국 zone EU300 없음/)
  })
})
