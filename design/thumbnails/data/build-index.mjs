#!/usr/bin/env node
// 대표 썸네일 제작 대상 인덱스 생성기
// 사용: node build-index.mjs            # thumbnails.json 갱신
//       node build-index.mjs --check    # 갱신 없이 리뷰 필요 항목만 출력
//
// 입력: ../../products/_generator/data/catalog.json  (상세페이지 생성기와 동일 정본)
// 출력: ./thumbnails.json
//
// 지명(label) 산출 규칙 — 에셋 정의 보고서 §4 「다국가 조합 상품 표기」 준수:
//   1국    → catalog 의 countriesKr[0] (정식 국가명)
//   2~3국  → naverName 의 권역 라벨 (예: 「남유럽2개국」) + 국가명 보조줄
//   4국+   → naverName 의 권역 라벨. 국가명 나열 금지(3국까지만 허용)
// naverName 은 실제 판매 중인 상품명이라 마케팅 권역 표기의 정본으로 취급한다.
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const CATALOG = join(HERE, '..', '..', 'products', '_generator', 'data', 'catalog.json')
const SALES = join(HERE, 'sales-rank.json')
const OUT = join(HERE, 'thumbnails.json')
const checkOnly = process.argv.includes('--check')

const catalog = JSON.parse(readFileSync(CATALOG, 'utf8'))
// 제작 우선순위는 판매 실적으로 정한다 — 86장을 한 번에 만들면 템플릿 결함 발견 시
// 전부 재작업이다. 상위 10개가 전체 판매의 81.3%.
const sales = JSON.parse(readFileSync(SALES, 'utf8'))
const rankBySku = new Map(sales.ranks.map((r) => [r.sku, r]))

// naverName 에서 권역 라벨만 뽑는다. 선행 브랜드 prefix 제거 후,
// 상품 속성 키워드가 처음 나오는 지점 앞까지가 라벨.
const PREFIX = /^\s*(\[[^\]]*\]|eSIM마니)\s*/
const STOP = /(무제한|종량제|데이터|eSIM|이심|유심|핫스팟|해외)/
function labelFromNaverName(name) {
  const rest = name.replace(PREFIX, '')
  const words = rest.split(/\s+/)
  const taken = []
  for (const w of words) {
    if (STOP.test(w)) break
    taken.push(w)
    // 「남유럽2개국 스페인 포르투갈 무제한…」 처럼 국가 수 뒤에 국가명이 이어지는
    // 상품명이 있다. 권역 라벨은 국가 수 토큰에서 끝난다.
    if (/\d+\s*개?국/.test(w)) break
  }
  return taken.join(' ').trim()
}

// 「남유럽2개국」 → 「남유럽 2개국」. 붙어 있으면 큰 타이포에서 뭉쳐 보인다.
function spaceLabel(s) {
  return s.replace(/([가-힣A-Za-z])(\d+개?국)/g, '$1 $2').trim()
}

const rows = []
for (const [zone, z] of Object.entries(catalog.zones)) {
  const countries = z.countriesKr ?? []
  const n = countries.length

  for (const [planType, node] of [
    ['unlimited', z.unlimited],
    ['quota', z.quota],
  ]) {
    if (!node) continue
    const review = []
    const raw = labelFromNaverName(node.naverName)

    let label
    if (n === 1) {
      label = countries[0]
      // 「튀르키예 터키」처럼 별칭을 함께 적은 상품명은 충돌이 아니다.
      // 카탈로그 국가명이 상품명 토큰에 아예 없을 때만 검토 대상.
      if (raw && !raw.split(/\s+/).includes(countries[0])) {
        review.push(
          `상품명 표기(${raw})와 카탈로그 국가명(${countries[0]}) 불일치 — 어느 쪽을 쓸지 확인`,
        )
      }
    } else {
      label = spaceLabel(raw)
      if (!label) {
        label = `유럽 ${n}개국`
        review.push('상품명에서 권역 라벨을 못 뽑음 — 기본값 사용')
      }
      const declared = label.match(/(\d+)\s*개?국/)
      if (declared && Number(declared[1]) !== n) {
        review.push(`상품명의 국가 수(${declared[1]})와 카탈로그 국가 수(${n}) 불일치`)
      }
    }

    if (label.split(/\s+/).length > 2) {
      review.push(`라벨이 ${label.split(/\s+/).length}어절 — 큰 타이포에서 줄바꿈 발생, 축약 검토`)
    }

    const rank = rankBySku.get(node.productCode) ?? null

    rows.push({
      sku: node.productCode,
      salesRank: rank?.rank ?? null,
      salesCount: rank?.count ?? 0,
      // top10 = 1차 제작 대상 (판매 81.3%) · top20 = 2차 (93.5%) · tail = 이후
      tier: rank ? (rank.rank <= 10 ? 'top10' : rank.rank <= 20 ? 'top20' : 'tail') : 'none',
      zone,
      planType,
      channelProductNo: node.channelProductNo ?? null,
      countryCount: n,
      countriesKr: countries,
      label,
      // 보조 국가명 줄 — 보고서 §4: 개별 국가명 나열은 3국까지
      sub: n >= 2 && n <= 3 ? countries.join(' · ') : '',
      badge: planType === 'unlimited' ? '무제한 데이터' : '종량제 데이터',
      naverName: node.naverName,
      review,
    })
  }
}

// 판매 실적 내림차순. 실적 없는 SKU(종량제 8개 — 2025년 0건)는 뒤로.
rows.sort((a, b) => b.salesCount - a.salesCount || a.sku.localeCompare(b.sku))

// 라벨 충돌 검사 — 보고서 「공용 이미지」 리스크. 같은 라벨 + 같은 플랜유형이면
// 120px 에서 두 상품이 구별되지 않아 서로를 잠식한다.
const seen = new Map()
for (const r of rows) {
  const key = `${r.label}|${r.planType}`
  if (seen.has(key)) {
    const other = seen.get(key)
    const msg = `라벨 충돌 — ${other.sku} 와 동일한 「${r.label}」. 120px 에서 구별 불가`
    r.review.push(msg)
    other.review.push(`라벨 충돌 — ${r.sku} 와 동일한 「${r.label}」. 120px 에서 구별 불가`)
  } else {
    seen.set(key, r)
  }
}

const out = {
  generatedFrom: 'design/products/_generator/data/catalog.json',
  canvas: { width: 1000, height: 1000, safeMargin: 50 },
  total: rows.length,
  byPlanType: {
    unlimited: rows.filter((r) => r.planType === 'unlimited').length,
    quota: rows.filter((r) => r.planType === 'quota').length,
  },
  byTier: {
    top10: rows.filter((r) => r.tier === 'top10').length,
    top20: rows.filter((r) => r.tier === 'top20').length,
    tail: rows.filter((r) => r.tier === 'tail').length,
    none: rows.filter((r) => r.tier === 'none').length,
  },
  salesSource: sales.source,
  items: rows,
}

const flagged = rows.filter((r) => r.review.length)
if (!checkOnly) {
  writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n', 'utf8')
  console.log(
    `thumbnails.json — ${rows.length}개 SKU (무제한 ${out.byPlanType.unlimited} · 종량제 ${out.byPlanType.quota})\n` +
      `우선순위: 1차 top10 ${out.byTier.top10}장 · 2차 top20 ${out.byTier.top20}장 · 이후 ${out.byTier.tail}장 · 실적없음 ${out.byTier.none}장`,
  )
}
console.log(`\n검토 필요 ${flagged.length}건:`)
for (const r of flagged) {
  console.log(`  ${r.sku.padEnd(8)} 「${r.label}」`)
  for (const m of r.review) console.log(`           - ${m}`)
}
