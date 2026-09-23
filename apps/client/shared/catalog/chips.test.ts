import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { COUNTRY_ALIASES } from '~/content/catalog-search'
import upcomingJson from '~/content/catalog-upcoming.json'
import { ERROR_ASIA_COUNTRIES } from '~/content/error-page'
import { POPULAR_COUNTRIES } from '~/content/popular'
import { errorChipsFromCatalog } from './chips'
import { activeCatalog } from './test-data'
import { readSource } from './test-source'

/** catalog spec S-7 — 오류 화면 칩은 빌드 때(modules/catalog.ts) K1 에서 골라 앱 설정으로 */
const catalog = activeCatalog()
const upcoming = upcomingJson.countries

describe('errorChipsFromCatalog — 빌드 때 칩', () => {
  it('실 카탈로그 — 인기 8(검색 빈 화면과 같은 목록) · 아시아 5', () => {
    const sets = errorChipsFromCatalog(
      catalog,
      upcoming,
      COUNTRY_ALIASES,
      POPULAR_COUNTRIES,
      ERROR_ASIA_COUNTRIES,
    )
    expect(sets.popular).toEqual([
      { iso3: 'NLD', iso2: 'NL', ko: '네덜란드' },
      { iso3: 'HRV', iso2: 'HR', ko: '크로아티아' },
      { iso3: 'FRA', iso2: 'FR', ko: '프랑스' },
      { iso3: 'GRC', iso2: 'GR', ko: '그리스' },
      { iso3: 'POL', iso2: 'PL', ko: '폴란드' },
      { iso3: 'NOR', iso2: 'NO', ko: '노르웨이' },
      { iso3: 'DEU', iso2: 'DE', ko: '독일' },
      { iso3: 'AUT', iso2: 'AT', ko: '오스트리아' },
    ])
    expect(sets.asia).toEqual([
      { iso3: 'VNM', iso2: 'VN', ko: '베트남' },
      { iso3: 'THA', iso2: 'TH', ko: '태국' },
      { iso3: 'SGP', iso2: 'SG', ko: '싱가포르' },
      { iso3: 'IDN', iso2: 'ID', ko: '인도네시아' },
      { iso3: 'HKG', iso2: 'HK', ko: '홍콩' },
    ])
  })

  it('아시아 나라가 카탈로그에 없으면(준비 중 포함) 빌드를 멈춘다', () => {
    expect(() =>
      errorChipsFromCatalog(catalog, upcoming, COUNTRY_ALIASES, POPULAR_COUNTRIES, [
        'VNM',
        'JPN',
        'ZZZ',
      ]),
    ).toThrow(/JPN · ZZZ/)
  })

  it('판매 중인 인기 국가가 8개가 안 되면 빌드를 멈춘다', () => {
    expect(() =>
      errorChipsFromCatalog(
        catalog,
        upcoming,
        COUNTRY_ALIASES,
        ['NLD', 'HRV', 'JPN'],
        ERROR_ASIA_COUNTRIES,
      ),
    ).toThrow(/2개다/)
  })
})

describe('modules/catalog.ts 결선 — 앱 설정 errorChips', () => {
  it('K1 · 준비 중 · 별칭 · 인기 · 아시아 목록으로 errorChipsFromCatalog 결과를 넣는다', () => {
    const FILE = fileURLToPath(new URL('../../modules/catalog.ts', import.meta.url))
    const code = readSource(FILE)
      .script.map((t) => t.text)
      .join(' ')
    expect(code).toContain(
      'nuxt . options . appConfig . errorChips = errorChipsFromCatalog ( catalog , upcoming . countries , COUNTRY_ALIASES , POPULAR_COUNTRIES , ERROR_ASIA_COUNTRIES , )',
    )
  })
})
