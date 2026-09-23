/**
 * 국가 검색 — spec F-4 · D-9 · D-10. 색인은 서버가 만들어 프리렌더하고(`/api/catalog/search-index`),
 * 매칭은 브라우저에서 입력할 때마다 한다(56개국 — 디바운스 불필요).
 *
 * 찾는 규칙(순위 순): 이름 앞부분 > 초성 앞부분 > 이름 부분 > 초성 부분 > ISO 정확 일치 > 영문 앞부분 > 영문 부분
 * > 도시 > 별칭(앞부분만). 영문은 발음 기호 · «&» 를 풀어 비교한다(«turkiye» → Türkiye).
 * 권역 이름(«북유럽»)으로 zone 을 찾지는 않는다(D-9).
 */
import { countriesOf, zonesOfCountry } from './derive'
import type { CatalogView } from './types'

export interface SearchEntry {
  iso3: string
  iso2: string
  /** 한글 이름 */
  ko: string
  /** 영문 이름 — 빌드(서버)에서 Intl.DisplayNames 로 만든다 */
  en: string
  cities: string[]
  aliases: string[]
  /** 그 나라가 들어간 zone 수 — 준비 중이면 0 */
  zoneCount: number
  /** 웹에 상품이 없는 나라(TSim 7) — 링크 없이 «준비 중» */
  upcoming: boolean
}

export type SearchVia = 'name' | 'chosung' | 'en' | 'iso' | 'city' | 'alias'

export interface SearchHit {
  entry: SearchEntry
  via: SearchVia
  /** 도시로 찾았으면 그 도시 */
  city?: string
}

export interface UpcomingCountry {
  iso3: string
  iso2: string
  nameKr: string
  cities: string[]
}

export function buildSearchIndex(
  catalog: CatalogView,
  upcoming: UpcomingCountry[],
  aliases: Record<string, string[]>,
  enName: (iso2: string) => string,
): SearchEntry[] {
  const sold = countriesOf(catalog).map(
    (c): SearchEntry => ({
      iso3: c.iso3,
      iso2: c.iso2,
      ko: c.nameKr,
      en: enName(c.iso2),
      cities: c.cities,
      aliases: aliases[c.iso3] ?? [],
      zoneCount: zonesOfCountry(catalog, c.iso3).length,
      upcoming: false,
    }),
  )
  const soldIso = new Set(sold.map((e) => e.iso3))
  const later = upcoming
    .filter((c) => !soldIso.has(c.iso3))
    .map(
      (c): SearchEntry => ({
        iso3: c.iso3,
        iso2: c.iso2,
        ko: c.nameKr,
        en: enName(c.iso2),
        cities: c.cities,
        aliases: aliases[c.iso3] ?? [],
        zoneCount: 0,
        upcoming: true,
      }),
    )
  return [...sold, ...later].sort((a, b) => a.ko.localeCompare(b.ko, 'ko'))
}

const CHOSUNG = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'

/** 한글 음절 → 초성(«프랑스» → «ㅍㄹㅅ»). 음절이 아닌 글자는 그대로 */
export function toChosung(s: string): string {
  let out = ''
  for (const ch of s) {
    const code = ch.charCodeAt(0)
    out += code >= 0xac00 && code <= 0xd7a3 ? CHOSUNG[Math.floor((code - 0xac00) / 588)] : ch
  }
  return out
}

/**
 * 비교용 정규화 — 소문자 · 공백 제거 · 라틴 발음 기호 제거(ü → u) · «&» → and.
 * NFD 로 풀어 결합 기호(U+0300–036F)만 지운 뒤 NFC 로 다시 묶는다 — 한글 음절은 그대로 돌아온다(초성 변환이 쓴다).
 */
export function norm(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .normalize('NFC')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/\s+/g, '')
}

/** 낮을수록 앞 — 매칭이 없으면 null */
function score(e: SearchEntry, q: string): { rank: number; via: SearchVia; city?: string } | null {
  const ko = norm(e.ko)
  const isChosungQuery = /^[ㄱ-ㅎ]+$/.test(q)
  if (ko.startsWith(q)) return { rank: 0, via: 'name' }
  if (isChosungQuery) {
    const cs = toChosung(ko)
    if (cs.startsWith(q)) return { rank: 1, via: 'chosung' }
    if (cs.includes(q)) return { rank: 3, via: 'chosung' }
  }
  if (ko.includes(q)) return { rank: 2, via: 'name' }
  if (q === e.iso3.toLowerCase() || q === e.iso2.toLowerCase()) return { rank: 4, via: 'iso' }
  const en = norm(e.en)
  if (en.startsWith(q)) return { rank: 5, via: 'en' }
  if (q.length >= 3 && en.includes(q)) return { rank: 6, via: 'en' }
  // 도시 · 별칭은 두 글자부터 — 한 글자(«스»)는 도시 이름에 줄줄이 걸린다(D-9)
  if ([...q].length < 2) return null
  const city =
    e.cities.find((c) => norm(c).startsWith(q)) ?? e.cities.find((c) => norm(c).includes(q))
  if (city) return { rank: 7, via: 'city', city }
  // 별칭은 앞부분만 — «la» 가 holland · england 에 걸리지 않게
  if (e.aliases.some((a) => norm(a).startsWith(q))) return { rank: 8, via: 'alias' }
  return null
}

export function searchCountries(index: SearchEntry[], query: string): SearchHit[] {
  const q = norm(query)
  if (q === '') return []
  return index
    .map((entry) => ({ entry, s: score(entry, q) }))
    .filter(
      (x): x is { entry: SearchEntry; s: NonNullable<ReturnType<typeof score>> } => x.s !== null,
    )
    .sort((a, b) => a.s.rank - b.s.rank || a.entry.ko.localeCompare(b.entry.ko, 'ko'))
    .map(({ entry, s }) => ({ entry, via: s.via, ...(s.city ? { city: s.city } : {}) }))
}
