/**
 * 오류 화면 갈래 판정(catalog spec S-7 · F-13) — 상태 · 경로 → 문안 · 국기 · 칩. `app/error.vue` 가 부른다.
 * 준비 중 나라 목록은 검색과 같은 `catalog-upcoming.json`(새 데이터 없음). 상태 코드는 바꾸지 않는다(D-22).
 * 구간 이름(`/countries` · `/products`)은 라우터 · 탭 판정(`activeTabOf`)처럼 대소문자를 가리고, 나라 코드만 가리지 않는다.
 */
import type { SearchEntry, UpcomingCountry } from '#shared/catalog/search'
import upcoming from '~/content/catalog-upcoming.json'
import {
  ERROR_ASIA_COUNTRIES,
  ERROR_COPY,
  upcomingCopy,
  type ErrorCopy,
  type ErrorKind,
} from '~/content/error-page'
import { POPULAR_COUNTRIES } from '~/content/popular'

export type ErrorChipsKind = 'popular' | 'asia'

export interface ErrorView {
  kind: ErrorKind
  copy: ErrorCopy
  /** 준비 중 나라면 국기 · 이름 */
  country: { iso2: string; nameKr: string } | null
  chips: ErrorChipsKind | null
}

export interface ErrorChip {
  iso3: string
  iso2: string
  ko: string
}

/** NuxtError → 상태 코드. 없거나 4xx · 5xx 가 아니면 500(잠시 오류) */
export function errorStatus(
  error: { status?: number | string; statusCode?: number | string } | null | undefined,
): number {
  const status = Number(error?.status ?? error?.statusCode)
  return Number.isInteger(status) && status >= 400 && status <= 599 ? status : 500
}

export function errorView(
  status: number,
  path: string,
  list: readonly UpcomingCountry[] = upcoming.countries,
): ErrorView {
  if (status !== 404) return { kind: 'error', copy: ERROR_COPY.error, country: null, chips: null }
  const m = path.match(/^\/countries\/([a-zA-Z]{3})\/?$/)
  const soon = m ? list.find((c) => c.iso3 === m[1]!.toUpperCase()) : undefined
  if (soon)
    return {
      kind: 'upcoming',
      copy: upcomingCopy(soon.nameKr),
      country: { iso2: soon.iso2, nameKr: soon.nameKr },
      chips: 'asia',
    }
  if (path.startsWith('/products/'))
    return { kind: 'product', copy: ERROR_COPY.product, country: null, chips: 'popular' }
  return { kind: 'page', copy: ERROR_COPY.page, country: null, chips: 'popular' }
}

/**
 * 검색 색인 → 오류 화면 칩(필요한 나라만 — payload 를 작게). 인기 국가 = 검색 빈 화면과 같은 앞 8개.
 * 준비 중 · 색인에 없는 코드는 건너뛴다.
 */
export function pickChips(
  index: readonly SearchEntry[],
  popular: readonly string[] = POPULAR_COUNTRIES,
  asia: readonly string[] = ERROR_ASIA_COUNTRIES,
): Record<ErrorChipsKind, ErrorChip[]> {
  const pick = (codes: readonly string[]) =>
    codes
      .map((iso3) => index.find((e) => e.iso3 === iso3 && !e.upcoming))
      .filter((e): e is SearchEntry => !!e)
      .map(({ iso3, iso2, ko }) => ({ iso3, iso2, ko }))
  return { popular: pick(popular).slice(0, 8), asia: pick(asia) }
}

/** 오류 화면의 머리 — app.vue 대신 그려지므로 lang · 제목 템플릿(app.vue 와 같은 « · 이심마니») · noindex 를 여기서 */
export function errorHead(view: ErrorView) {
  return {
    htmlAttrs: { lang: 'ko' },
    title: view.copy.title,
    titleTemplate: (title?: string) => (title ? `${title} · 이심마니` : '이심마니'),
    meta: [{ name: 'robots', content: 'noindex, nofollow' }],
  }
}

/** 그 갈래가 그릴 칩 — 칩이 없는 갈래(잠시 오류)는 늘 [] */
export function errorChips(
  view: ErrorView,
  sets: Record<ErrorChipsKind, ErrorChip[]>,
): ErrorChip[] {
  return view.chips ? sets[view.chips] : []
}
