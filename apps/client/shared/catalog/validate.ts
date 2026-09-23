/**
 * 카탈로그 검증기 — spec F-1. 하나라도 걸리면 throw 한다(빌드 · 서버 기동 실패).
 *
 * 웹은 «있으면 판다» — 판매 중 · 전시 중 · 판매 가능한 옵션만 싣는다. export(W1-1)가 이미 거르더라도
 * 여기서 한 번 더 확인한다(export 규칙이 바뀌어도 판매 중지 상품이 웹에 나가지 않게).
 */
import { adaptCatalog, type AdaptedCatalog } from './adapter'
import type { CatalogView, ZoneView } from './types'

export class CatalogValidationError extends Error {
  constructor(readonly issues: string[]) {
    super(`catalog.json 검증 실패 ${issues.length}건:\n- ${issues.slice(0, 30).join('\n- ')}`)
    this.name = 'CatalogValidationError'
  }
}

const ZONE_RE = /^[A-Z0-9]{5}$/
const ISO3_RE = /^[A-Z]{3}$/
const ISO2_RE = /^[A-Z]{2}$/
const DAILY_DAYS = Array.from({ length: 30 }, (_, i) => i + 1)
const QUOTA_DAYS = 30

export function expectedNaverUrl(channelProductNo: number, sku: string): string {
  return `https://smartstore.naver.com/esimmany/products/${channelProductNo}?nt_source=esimmany-web&nt_medium=detail&nt_detail=${sku}`
}

function checkAssetPath(path: string, prefix: string, at: string, issues: string[]) {
  if (/pstatic\.net|shop-phinf/i.test(path))
    issues.push(`${at}: 네이버 CDN 경로(${path}) — 자사 자산만(A6)`)
  else if (!path.startsWith(prefix)) issues.push(`${at}: ${prefix} 로 시작하지 않는다(${path})`)
}

function check(c: AdaptedCatalog, issues: string[]) {
  const zones = new Set<string>()
  const skus = new Set<string>()
  if (c.zones.length === 0) issues.push('zones: 비어 있다')
  for (const z of c.zones) {
    const at = `zone ${z.zone || '?'}`
    if (!ZONE_RE.test(z.zone)) issues.push(`${at}: zone 코드 모양이 아니다`)
    if (zones.has(z.zone)) issues.push(`${at}: zone 중복`)
    zones.add(z.zone)
    if (z.label.trim() === '') issues.push(`${at}: 라벨이 비었다`)
    if (z.countries.length === 0) issues.push(`${at}: 나라가 없다`)
    for (const k of z.countries) {
      if (!ISO3_RE.test(k.iso3)) issues.push(`${at}: iso3 모양이 아니다(${k.iso3})`)
      if (!ISO2_RE.test(k.iso2)) issues.push(`${at}: ${k.iso3} iso2 가 없다`)
      if (k.nameKr.trim() === '') issues.push(`${at}: ${k.iso3} 이름이 없다`)
    }
    checkAssetPath(z.map.src, '/catalog/maps/', `${at}.map`, issues)
    if (z.products.length === 0) issues.push(`${at}: 상품이 없다`)
    const kinds = new Set<string>()
    for (const p of z.products) {
      const pat = `${p.sku || '?'}`
      if (p.sku !== `${z.zone}${p.kind}`)
        issues.push(`${pat}: SKU 가 zone+kind(${z.zone}${p.kind})가 아니다`)
      if (skus.has(p.sku)) issues.push(`${pat}: SKU 중복`)
      skus.add(p.sku)
      if (kinds.has(p.kind)) issues.push(`${at}: kind ${p.kind} 상품이 둘 이상`)
      kinds.add(p.kind)
      if (p.saleStatus !== 'SALE' || p.displayStatus !== 'ON')
        issues.push(`${pat}: 판매 ${p.saleStatus} · 전시 ${p.displayStatus} — SALE/ON 만 싣는다`)
      if (!Number.isInteger(p.channelProductNo) || p.channelProductNo <= 0)
        issues.push(`${pat}: 채널상품번호가 없다`)
      else if (p.naverUrl !== expectedNaverUrl(p.channelProductNo, p.sku))
        issues.push(`${pat}: naverUrl 이 K2 모양이 아니다(${p.naverUrl})`)
      checkAssetPath(p.thumb, '/catalog/thumbs/', `${pat}.thumb`, issues)
      if (p.options.length === 0) issues.push(`${pat}: 옵션이 없다`)
      const cells = new Set<string>()
      for (const o of p.options) {
        const oat = `${pat} ${o.code || o.id}`
        const key = `${o.cap}/${o.days}`
        if (cells.has(key)) issues.push(`${oat}: (용량 ${o.cap} · ${o.days}일) 중복`)
        cells.add(key)
        if (!Number.isInteger(o.finalWon) || o.finalWon <= 0)
          issues.push(`${oat}: 최종가가 0 이하이거나 정수가 아니다(${o.finalWon})`)
        if (!(o.cap > 0)) issues.push(`${oat}: 용량이 0 이하`)
        if (!Number.isInteger(o.days) || o.days <= 0) issues.push(`${oat}: 일수가 0 이하`)
        if (o.usable !== true) issues.push(`${oat}: 판매 가능(usable)이 true 가 아니다`)
        if (p.kind === 'L' && o.days !== QUOTA_DAYS)
          issues.push(`${oat}: 종량제 일수가 ${QUOTA_DAYS}일이 아니다(${o.days})`)
      }
      if (p.kind === 'U') {
        for (const cap of new Set(p.options.map((o) => o.cap))) {
          const missing = DAILY_DAYS.filter((d) => !cells.has(`${cap}/${d}`))
          if (missing.length > 0)
            issues.push(
              `${pat}: 매일 ${cap}GB 에 ${missing.join(',')}일이 없다 — 1~30일은 하루 단위`,
            )
        }
      }
    }
  }
}

/** K1 을 검증하고 화면 모델로 바꾼다. 검증 전용 필드(판매 상태 · usable)는 버린다 */
export function parseCatalog(raw: unknown): CatalogView {
  const issues: string[] = []
  const adapted = adaptCatalog(raw, issues)
  check(adapted, issues)
  if (issues.length > 0) throw new CatalogValidationError(issues)
  return {
    generatedAt: adapted.generatedAt,
    fixture: adapted.fixture,
    zones: adapted.zones.map(
      (z): ZoneView => ({
        ...z,
        products: z.products.map(({ saleStatus: _s, displayStatus: _d, options, ...p }) => ({
          ...p,
          options: options.map(({ usable: _u, ...o }) => o),
        })),
      }),
    ),
  }
}
