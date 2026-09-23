/**
 * SSR · SEO(catalog spec F-9 · S-6 · D-15 · D-17) — 프리렌더 라우트 목록 · sitemap · 메타를 카탈로그에서 만든다.
 * canonical · og:url 은 빌드 상수 `https://esimmany.com`(호스트 판정 0 — app.esimmany.com 에서 떠도 canonical 은 판매 사이트).
 * 와일드카드 routeRules 는 페이지를 생성하지 않으므로 라우트를 **명시**한다(조사 확인).
 */
import { isNoindexPath } from '../utils/robots'
import { SITE_ORIGIN } from '../utils/site'
import { countriesOf, lowestWon, productOf } from './derive'
import { formatWon } from './format'
import type { CatalogView, ZoneView } from './types'

export { SITE_ORIGIN }

/** 카탈로그와 무관한 정적 페이지 — 법정 4종 · 가이드 · 지원 기기 */
export const STATIC_ROUTES = [
  '/terms',
  '/privacy',
  '/refund',
  '/business',
  '/guide',
  '/supported-devices',
] as const

export function catalogRoutes(catalog: CatalogView): string[] {
  return [
    ...countriesOf(catalog).map((c) => `/countries/${c.iso3.toLowerCase()}`),
    ...catalog.zones.map((z) => `/products/${z.zone.toLowerCase()}`),
  ]
}

/** nitro.prerender.routes — 홈 · 검색(noindex 지만 payload 를 고정한다) · 카탈로그 · 정적 */
export function prerenderRoutes(catalog: CatalogView): string[] {
  return ['/', '/search', ...catalogRoutes(catalog), ...STATIC_ROUTES]
}

/** sitemap — 색인할 경로만(noindex 목록 단일 출처로 거른다) */
export function sitemapPaths(catalog: CatalogView): string[] {
  return ['/', ...STATIC_ROUTES, ...catalogRoutes(catalog)].filter((p) => !isNoindexPath(p))
}

function xmlEscape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function buildSitemapXml(paths: string[], lastmod: string): string {
  const day = lastmod.slice(0, 10)
  const urls = paths
    .map((p) => `  <url><loc>${xmlEscape(SITE_ORIGIN + p)}</loc><lastmod>${day}</lastmod></url>`)
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

export function canonicalUrl(path: string): string {
  return SITE_ORIGIN + (path === '/' ? '/' : path.replace(/\/+$/, ''))
}

export interface PageMeta {
  title: string
  description: string
}

/** 국가 페이지 — «{나라} eSIM · 무제한 데이터 {최저가}부터»(제목 템플릿이 « · 이심마니» 를 붙인다) */
export function countryMeta(nameKr: string, zones: ZoneView[]): PageMeta {
  const low = Math.min(...zones.map(lowestWon))
  const hasU = zones.some((z) => productOf(z, 'U'))
  return {
    title: `${nameKr} eSIM · ${hasU ? '무제한 데이터 ' : ''}${formatWon(low)}부터`,
    description:
      `${nameKr}에서 쓰는 eSIM 상품 ${zones.length}개. 사용일수는 현지에서 처음 연결된 때부터 24시간 단위로 세요. ` +
      '테더링 가능 · 카카오톡으로 1~2분 안에 발급 링크를 보내 드려요.',
  }
}

/** 상품 상세 — «{라벨} eSIM — 무제한 · 종량제» */
export function zoneMeta(zone: ZoneView): PageMeta {
  const kinds = zone.products.map((p) => (p.kind === 'U' ? '무제한' : '종량제')).join(' · ')
  const multi = zone.countries.length > 1
  return {
    title: `${zone.label} eSIM — ${kinds}`,
    description:
      `${zone.label} eSIM ${formatWon(lowestWon(zone))}부터. ` +
      (multi
        ? `${zone.countries.length}개국에서 하나의 eSIM 으로, 나라를 옮겨도 자동으로 연결돼요. `
        : '') +
      '사용일수는 처음 연결된 때부터 24시간 단위 · 테더링 가능.',
  }
}

export const HOME_META: PageMeta = {
  title: '해외여행 eSIM',
  description:
    '가는 나라를 고르고 용량 · 기간별 가격을 비교해 보세요. 사용일수는 현지에서 처음 연결된 때부터 24시간 단위 · 테더링 가능.',
}
