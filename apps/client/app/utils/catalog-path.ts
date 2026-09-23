/**
 * 카탈로그 URL — 코드는 대문자(K1 `CZE` · `EU340`), URL 은 소문자(catalog spec D-13).
 * 라우터 `sensitive: true` 는 정적 구간(`/countries`)만 가르고 파라미터(`FRA`/`fra`)는 가르지 않는다 →
 * 대문자 · 섞인 변형은 소문자로 301, 모양이 틀린 파라미터는 404. 프리렌더 파일은 소문자 한 벌뿐이다.
 */
export type CatalogSection = 'countries' | 'products'

const PARAM_RE: Record<CatalogSection, RegExp> = {
  countries: /^[a-z]{3}$/,
  products: /^[a-z0-9]{5}$/,
}

/** `/countries/FRA` → `/countries/fra`. 이미 소문자거나 카탈로그 경로가 아니면 null */
export function lowercaseRedirect(path: string): string | null {
  const m = path.match(/^\/(countries|products)\/([^/]+)\/?$/)
  if (!m) return null
  const param = m[2]!
  const lower = param.toLowerCase()
  return lower === param ? null : `/${m[1]}/${lower}`
}

export function isCatalogParam(section: CatalogSection, param: string): boolean {
  return PARAM_RE[section].test(param)
}
