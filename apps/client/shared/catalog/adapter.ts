/**
 * K1(catalog.json) → 화면 모델 어댑터 — **K1 필드명은 이 파일에만 적는다**(plan §2.1).
 *
 * 필드명은 W1-1 export 의 README(H-002)가 정한다. 이름이 바뀌면 이 파일만 고친다
 * (자주 쓰는 이름은 `K` 표, 옵션 · 나라 · 핀의 잎 필드는 각 함수 안).
 * 모양이 틀린 값은 버리지 않고 `issues` 에 적는다 — 판정(빌드 실패)은 `validate.ts` 가 한다.
 */
import type { CountryView, Kind, OptionView, PinView, ProductView, ZoneView } from './types'

/** K1 필드명 표 — H-002 출력 스키마(2026-09-23 · 9957231) */
const K = {
  meta: 'meta',
  generatedAt: 'generatedAt',
  fixture: 'fixture',
  zones: 'zones',
  zone: 'zone',
  zoneLabel: 'nameKr',
  zoneSubtitle: 'subtitle',
  countries: 'countries',
  map: 'map',
  mapSvg: 'svg',
  pins: 'pins',
  products: 'products',
  sku: 'sku',
  kind: 'kind',
  channelProductNo: 'channelProductNo',
  naverUrl: 'naverUrl',
  saleStatus: 'saleStatus',
  displayStatus: 'displayStatus',
  images: 'images',
  thumb: 'thumb',
  options: 'options',
} as const

/** 검증에만 쓰는 값을 화면 모델 옆에 붙여 둔다(검증 뒤 버린다) */
export interface AdaptedOption extends OptionView {
  usable: boolean | undefined
}
export interface AdaptedProduct extends Omit<ProductView, 'options'> {
  saleStatus: string
  displayStatus: string
  options: AdaptedOption[]
}
export interface AdaptedZone extends Omit<ZoneView, 'products'> {
  products: AdaptedProduct[]
}
export interface AdaptedCatalog {
  generatedAt: string
  fixture: boolean
  zones: AdaptedZone[]
}

type Rec = Record<string, unknown>

function isRec(v: unknown): v is Rec {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

class Reader {
  constructor(readonly issues: string[]) {}

  rec(v: unknown, at: string): Rec {
    if (isRec(v)) return v
    this.issues.push(`${at}: 객체가 아니다`)
    return {}
  }

  arr(o: Rec, key: string, at: string): unknown[] {
    const v = o[key]
    if (Array.isArray(v)) return v
    this.issues.push(`${at}.${key}: 배열이 없다`)
    return []
  }

  str(o: Rec, key: string, at: string, { optional = false } = {}): string {
    const v = o[key]
    if (typeof v === 'string' && (optional || v.trim() !== '')) return v
    if (optional && (v === undefined || v === null)) return ''
    this.issues.push(`${at}.${key}: 문자열이 없다`)
    return ''
  }

  num(o: Rec, key: string, at: string): number {
    const v = o[key]
    if (typeof v === 'number' && Number.isFinite(v)) return v
    this.issues.push(`${at}.${key}: 숫자가 없다`)
    return Number.NaN
  }
}

function adaptOption(r: Reader, raw: unknown, at: string): AdaptedOption {
  const o = r.rec(raw, at)
  return {
    id: r.num(o, 'id', at),
    code: r.str(o, 'code', at),
    cap: r.num(o, 'cap', at),
    days: r.num(o, 'days', at),
    name1: r.str(o, 'optionName1', at),
    name2: r.str(o, 'optionName2', at),
    finalWon: r.num(o, 'finalWon', at),
    usable: typeof o.usable === 'boolean' ? o.usable : undefined,
  }
}

function adaptProduct(r: Reader, raw: unknown, at: string): AdaptedProduct {
  const p = r.rec(raw, at)
  const kind = p[K.kind]
  if (kind !== 'U' && kind !== 'L')
    r.issues.push(`${at}.${K.kind}: U · L 이 아니다(${String(kind)})`)
  const images = r.rec(p[K.images], `${at}.${K.images}`)
  const options = r.arr(p, K.options, at).map((o, i) => adaptOption(r, o, `${at}.options[${i}]`))
  options.sort((a, b) => a.cap - b.cap || a.days - b.days)
  return {
    sku: r.str(p, K.sku, at),
    kind: kind as Kind,
    channelProductNo: r.num(p, K.channelProductNo, at),
    naverUrl: r.str(p, K.naverUrl, at),
    thumb: r.str(images, K.thumb, `${at}.${K.images}`),
    saleStatus: r.str(p, K.saleStatus, at),
    displayStatus: r.str(p, K.displayStatus, at),
    options,
  }
}

function adaptCountry(r: Reader, raw: unknown, at: string): CountryView {
  const c = r.rec(raw, at)
  const operators = c.operators
  return {
    iso3: r.str(c, 'iso3', at),
    iso2: r.str(c, 'iso2', at),
    nameKr: r.str(c, 'nameKr', at),
    cities: Array.isArray(c.cities)
      ? c.cities.filter((x): x is string => typeof x === 'string')
      : [],
    operators: Array.isArray(operators)
      ? operators.filter((x): x is string => typeof x === 'string')
      : null,
    network: typeof c.network === 'string' ? c.network : null,
  }
}

function adaptPin(r: Reader, raw: unknown, at: string): PinView {
  const p = r.rec(raw, at)
  return {
    name: r.str(p, 'name', at),
    x: r.num(p, 'x', at),
    y: r.num(p, 'y', at),
    big: p.size === 'big',
    labelLeft: p.labelDir === 'left',
  }
}

function adaptZone(r: Reader, raw: unknown, at: string): AdaptedZone {
  const z = r.rec(raw, at)
  const map = r.rec(z[K.map], `${at}.${K.map}`)
  const products = r
    .arr(z, K.products, at)
    .map((p, i) => adaptProduct(r, p, `${at}.products[${i}]`))
  products.sort((a, b) => (a.kind === b.kind ? 0 : a.kind === 'U' ? -1 : 1))
  return {
    zone: r.str(z, K.zone, at),
    label: r.str(z, K.zoneLabel, at),
    subtitle: r.str(z, K.zoneSubtitle, at, { optional: true }),
    countries: r.arr(z, K.countries, at).map((c, i) => adaptCountry(r, c, `${at}.countries[${i}]`)),
    map: {
      src: r.str(map, K.mapSvg, `${at}.${K.map}`),
      pins: Array.isArray(map[K.pins])
        ? (map[K.pins] as unknown[]).map((p, i) => adaptPin(r, p, `${at}.map.pins[${i}]`))
        : [],
    },
    products,
  }
}

export function adaptCatalog(raw: unknown, issues: string[]): AdaptedCatalog {
  const r = new Reader(issues)
  const root = r.rec(raw, 'catalog')
  const meta = r.rec(root[K.meta], `catalog.${K.meta}`)
  return {
    generatedAt: r.str(meta, K.generatedAt, 'catalog.meta'),
    fixture: typeof meta[K.fixture] === 'string' && (meta[K.fixture] as string) !== '',
    zones: r.arr(root, K.zones, 'catalog').map((z, i) => adaptZone(r, z, `zones[${i}]`)),
  }
}
