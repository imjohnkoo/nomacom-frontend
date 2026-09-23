/**
 * 테스트 전용 — 카탈로그 파일 읽기(앱 코드에서 import 하지 않는다).
 *
 * - 표본(`fixture*`): 기대값을 숫자로 박은 테스트용 — 스냅샷 2026-09-22 에서 뽑은 5 zone · 7 SKU
 * - 지금 빌드가 쓰는 것(`active*`): 실 catalog.json(W1-1 export)이 있으면 그것, 없으면 표본.
 *   «목록 코드가 다 있어야 한다» · «전 옵션 대조» 처럼 실데이터에서 돌아야 뜻이 있는 테스트가 쓴다.
 */
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { CatalogView } from './types'
import { parseCatalog } from './validate'

export const APP_DIR = fileURLToPath(new URL('../../', import.meta.url))
export const FIXTURE_CATALOG_FILE = 'server/data/catalog.fixture.json'
const REAL_CATALOG_FILE = 'server/data/catalog.json'
export const ACTIVE_CATALOG_FILE = existsSync(`${APP_DIR}${REAL_CATALOG_FILE}`)
  ? REAL_CATALOG_FILE
  : FIXTURE_CATALOG_FILE

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- 원본 K1 을 그대로 다루는 변이 테스트용
export type RawCatalog = any

export const readRaw = (file: string): RawCatalog =>
  JSON.parse(readFileSync(`${APP_DIR}${file}`, 'utf8'))
export const fixtureRaw = (): RawCatalog => readRaw(FIXTURE_CATALOG_FILE)
export const activeRaw = (): RawCatalog => readRaw(ACTIVE_CATALOG_FILE)
export const fixtureCatalog = (): CatalogView => parseCatalog(fixtureRaw())
export const activeCatalog = (): CatalogView => parseCatalog(activeRaw())

/**
 * 합성 zone — 표본에 없는 경계(국가 수 · 가격 순서)를 만들려고 원본 K1 에 zone 하나를 덧붙인다.
 * 나라는 원본의 같은 iso3 값을 복사하고, 상품은 FRA00U 를 새 SKU 로 다시 붙인다(코드 · 경로 · 링크 포함).
 * 최저가가 `lowestWon` 이 되도록 모든 옵션 가격을 같은 폭만큼 옮긴다.
 */
export function addSynthZone(
  raw: RawCatalog,
  {
    zone,
    iso3s,
    lowestWon,
    label,
  }: { zone: string; iso3s: string[]; lowestWon: number; label?: string },
): RawCatalog {
  const countries = iso3s.map((iso3) => {
    const found = raw.zones
      .flatMap((z: RawCatalog) => z.countries)
      .find((c: RawCatalog) => c.iso3 === iso3)
    if (!found) throw new Error(`표본에 ${iso3} 가 없다`)
    return structuredClone(found)
  })
  const template = raw.zones
    .flatMap((z: RawCatalog) => z.products)
    .find((p: RawCatalog) => p.sku === 'FRA00U')
  const product = structuredClone(template)
  const sku = `${zone}U`
  const shift = lowestWon - Math.min(...product.options.map((o: RawCatalog) => o.finalWon))
  product.sku = sku
  product.channelProductNo = 1_000_000 + raw.zones.length
  product.naverUrl = `https://smartstore.naver.com/esimmany/products/${product.channelProductNo}?nt_source=esimmany-web&nt_medium=detail&nt_detail=${sku}`
  product.images = { thumb: `/catalog/thumbs/${sku}.webp` }
  for (const o of product.options) {
    o.code = `${sku}${o.code.slice(sku.length)}`
    o.finalWon += shift
  }
  raw.zones.push({
    zone,
    nameKr: label ?? `합성 ${iso3s.length}개국`,
    subtitle: `합성 부제 ${zone}`,
    countries,
    map: { svg: `/catalog/maps/${zone}.svg`, pins: [] },
    products: [product],
  })
  return raw
}
