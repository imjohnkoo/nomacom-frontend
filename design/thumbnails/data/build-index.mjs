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
//   4국+   → 「{대표국}·{대표국} {N}개국」 (john 결정 2026-08-20). 아래 대표국 산출 참조
// naverName 은 실제 판매 중인 상품명이라 마케팅 권역 표기의 정본으로 취급한다.
// data/label-overrides.json 에 { "EU044": "네덜란드·벨기에 4개국" } 형태로 적으면
// 자동 산출을 덮어쓴다 — 마케팅 판단이 자동 규칙과 다를 때 쓰는 탈출구.
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const CATALOG = join(HERE, '..', '..', 'products', '_generator', 'data', 'catalog.json')
const SALES = join(HERE, 'sales-rank.json')
const OVERRIDES = join(HERE, 'label-overrides.json')
const OUT = join(HERE, 'thumbnails.json')
const checkOnly = process.argv.includes('--check')

const catalog = JSON.parse(readFileSync(CATALOG, 'utf8'))
// 제작 우선순위는 판매 실적으로 정한다 — 86장을 한 번에 만들면 템플릿 결함 발견 시
// 전부 재작업이다. 상위 10개가 전체 판매의 81.3%.
const sales = JSON.parse(readFileSync(SALES, 'utf8'))
const rankBySku = new Map(sales.ranks.map((r) => [r.sku, r]))
const overrides = existsSync(OVERRIDES) ? JSON.parse(readFileSync(OVERRIDES, 'utf8')) : {}

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

// ── 국기 (john 결정 2026-08-20) ──────────────────────────────────
// 에셋 형식은 이모지. SVG 세트를 수급·관리할 필요가 없고, 문장(紋章)이 든
// 스페인·포르투갈·크로아티아·영국·튀르키예까지 전부 정확히 나온다.
// 헤드리스 Chromium 에서도 Apple Color Emoji 로 렌더되는 것을 실측 확인했다.
// 카탈로그는 ISO3 를 쓰는데 이모지는 ISO2 의 regional indicator 쌍이라 변환한다.
const ISO3_TO_ISO2 = {
  AUT: 'AT',
  BEL: 'BE',
  BGR: 'BG',
  CHE: 'CH',
  CYP: 'CY',
  CZE: 'CZ',
  DEU: 'DE',
  DNK: 'DK',
  ESP: 'ES',
  EST: 'EE',
  FIN: 'FI',
  FRA: 'FR',
  GBR: 'GB',
  GRC: 'GR',
  HRV: 'HR',
  HUN: 'HU',
  IRL: 'IE',
  ISL: 'IS',
  ITA: 'IT',
  LIE: 'LI',
  LTU: 'LT',
  LUX: 'LU',
  LVA: 'LV',
  MKD: 'MK',
  MLT: 'MT',
  NLD: 'NL',
  NOR: 'NO',
  POL: 'PL',
  PRT: 'PT',
  ROU: 'RO',
  SVK: 'SK',
  SVN: 'SI',
  SWE: 'SE',
  TUR: 'TR',
}
const flagEmoji = (iso3) => {
  const i2 = ISO3_TO_ISO2[iso3]
  if (!i2) return null
  return String.fromCodePoint(...[...i2].map((ch) => 0x1f1e6 + ch.charCodeAt(0) - 65))
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
      // top10 = 판매 81.3% · top20 = 93.5% · tail = 이후
      tier: rank ? (rank.rank <= 10 ? 'top10' : rank.rank <= 20 ? 'top20' : 'tail') : 'none',
      // 제작·업로드 대상 여부 (오너 승인 2026-08-21 — 무제한 48장 전량).
      //
      // 종량제 8개는 제외한다. 같은 zone 의 무제한과 배지 하나만 달라 120px 에서
      // 다른 픽셀이 6.7% 뿐인데, EP 가이드가 「동일 이미지를 가진 상품 전체가 노출 중단」
      // 이라 적발되면 짝이 되는 무제한 주력 상품까지 함께 내려간다.
      // 「팔 때 다시 보자」가 아니라 「올리지 않는다」가 성립 조건이다.
      // 배경색까지 갈라 재설계한 뒤에 다시 연다.
      produce: planType === 'unlimited',
      produceHold:
        planType === 'quota'
          ? '종량제 — 무제한과 120px 구별 불가, 공용 이미지 판정 시 무제한까지 노출 중단'
          : null,
      zone,
      planType,
      channelProductNo: node.channelProductNo ?? null,
      countryCount: n,
      countriesKr: countries,
      countriesIso: z.countriesIso ?? [],
      // 구성 국가 전부. 6개국이면 6개 다 넣는다 (john 결정) — 일부만 넣으면
      // 「N개국」 텍스트와 그림이 어긋나 개수를 오독한다.
      flags: (z.countriesIso ?? []).map(flagEmoji).filter(Boolean),
      label,
      // 보조 국가명 줄.
      //   2~3국 → 구성 국가 전부
      //   4국+  → 지명에 못 들어간 나머지 국가 (아래 대표국 후처리에서 채운다)
      // 지명이 「프랑스·이탈리아 4개국」인데 나머지 2개국이 어디인지 알 길이 없던
      // 정보 공백을 메운다 (john 2026-08-21).
      sub: n >= 2 && n <= 3 ? countries.join(' · ') : '',
      badge: planType === 'unlimited' ? '무제한 데이터' : '종량제 데이터',
      naverName: node.naverName,
      review,
    })
  }
}

// 판매 실적 내림차순. 실적 없는 SKU(종량제 8개 — 2025년 0건)는 뒤로.
rows.sort((a, b) => b.salesCount - a.salesCount || a.sku.localeCompare(b.sku))

// ── 4개국 이상: 「{대표국}·{대표국} {N}개국」 ────────────────────────
// 권역 라벨만 쓰면 EU042/EU044(둘 다 「유럽 4개국」), EU061/EU062(둘 다 「서유럽 6개국」)
// 처럼 서로 다른 상품이 글자 단위로 같아진다 — 「공용 이미지」 판정 리스크에 직결.
// 대표국 2개를 앞세워 가른다 (john 결정 2026-08-20).
//
// 대표국 선정 근거 두 축:
//   ① 희소성 — 4개국 이상 라인업 안에서 그 나라가 몇 번 등장하는가. 적게 나올수록
//      그 SKU 를 특정한다. 「체코」는 5개 상품에 들어 있어 대표로 쓰면 아무것도 못 가른다.
//   ② 인지도 — 그 나라 단독 SKU 의 2025 실판매 건수. 우리 고객이 실제로 고른 순서라
//      「어느 나라가 유명한가」를 추측하지 않아도 된다. 희소성 동률일 때 쓴다.
//
// 그 다음 혼동쌍(구성이 겹치는 두 zone)을 유사도 높은 순으로 훑으며, 각자 상대에게
// 없는 「고유국」을 앞자리에 강제한다. 유사도 순서가 중요하다 — EU062 는 EU041 과도
// EU061 과도 혼동되는데, 더 닮은 EU061 기준(체코)으로 갈라야 실제로 구별된다.
const demandByCountry = new Map()
for (const r of rows) {
  if (r.countryCount === 1 && r.planType === 'unlimited') {
    demandByCountry.set(r.countriesKr[0], r.salesCount)
  }
}
const demand = (c) => demandByCountry.get(c) ?? 0

// zone 단위로 묶는다 — 같은 zone 의 무제한/종량제는 같은 라벨을 쓴다.
const multiZones = new Map()
for (const r of rows) {
  if (r.countryCount < 4) continue
  if (!multiZones.has(r.zone)) {
    multiZones.set(r.zone, { zone: r.zone, countries: r.countriesKr, n: r.countryCount, rows: [] })
  }
  multiZones.get(r.zone).rows.push(r)
}
const zoneList = [...multiZones.values()]

const freq = new Map()
for (const z of zoneList) for (const c of z.countries) freq.set(c, (freq.get(c) ?? 0) + 1)

// 희소성 오름차순 → 인지도 내림차순 → 이름순(결정적)
const rank = (list) =>
  [...list].sort((a, b) => freq.get(a) - freq.get(b) || demand(b) - demand(a) || a.localeCompare(b))

const jaccard = (a, b) => {
  const A = new Set(a.countries)
  const B = new Set(b.countries)
  const inter = [...A].filter((x) => B.has(x)).length
  return inter / new Set([...A, ...B]).size
}

const pairs = []
for (let i = 0; i < zoneList.length; i++) {
  for (let j = i + 1; j < zoneList.length; j++) {
    const x = zoneList[i]
    const y = zoneList[j]
    const A = new Set(x.countries)
    const B = new Set(y.countries)
    const inter = [...A].filter((c) => B.has(c)).length
    // 포함관계이거나 절반 이상 겹치면 혼동쌍. 3개국 이상 공유도 실무상 혼동된다.
    if (inter === A.size || inter === B.size || jaccard(x, y) >= 0.4 || inter >= 3) {
      pairs.push({ x, y, sim: jaccard(x, y) })
    }
  }
}
pairs.sort((p, q) => q.sim - p.sim)

for (const { x, y } of pairs) {
  const ux = rank(x.countries.filter((c) => !y.countries.includes(c)))
  const uy = rank(y.countries.filter((c) => !x.countries.includes(c)))
  if (ux.length && !x.forced) x.forced = ux[0]
  if (uy.length && !y.forced) y.forced = uy[0]
  if (!ux.length) x.subsetOf = y.zone
  if (!uy.length) y.subsetOf = x.zone
}

// 라벨 길이 예산. 한글 1자 = 1, 숫자 = 1 로 세고 12 를 넘으면 지명이 하한 100px 에서도
// 3줄로 밀린다(EU051 「크로아티아·슬로베니아 5개국」 = 13 에서 실측 확인).
// 앞자리(구별 담당)는 고정하고 뒷자리만 예산 안에서 짧은 후보로 바꾼다.
const LABEL_BUDGET = 12
const labelCost = (s) => (s.match(/[가-힣0-9]/g) ?? []).length

for (const z of zoneList) {
  const ranked = rank(z.countries)
  const first = z.forced ?? ranked[0]
  const rest = ranked.filter((c) => c !== first)
  const fits = (c) => labelCost(`${first}·${c} ${z.n}개국`) <= LABEL_BUDGET
  const second = rest.find(fits) ?? rest[0]
  const auto = `${first}·${second} ${z.n}개국`
  if (labelCost(auto) > LABEL_BUDGET) {
    for (const r of z.rows) {
      r.review.push(
        `라벨 「${auto}」 이 길어 지명이 하한(100px)에서 3줄로 밀린다 — label-overrides.json 으로 축약 필요`,
      )
    }
  }
  const label = overrides[z.zone] ?? auto
  // 지명에 오른 대표국을 뺀 나머지를 보조줄로. 카탈로그 순서를 유지해
  // 상세페이지·상품명과 국가 나열 순서가 어긋나지 않게 한다.
  const restKr = z.countries.filter((c) => c !== first && c !== second)

  // 대표국 1개 대안. 2개짜리 지명이 2줄에 안 들어갈 때 렌더 단계에서 여기로 갈아탄다
  // (john 2026-08-21 — 문제 SKU 만 1개로, 나머지는 2개 유지).
  // 어느 SKU 가 해당하는지는 실제 폭을 재봐야 알 수 있어서 여기서 고르지 않는다.
  const restSingle = z.countries.filter((c) => c !== first)

  for (const r of z.rows) {
    r.label = label
    r.reps = [first, second]
    r.sub = restKr.join(' · ')
    r.labelSingle = overrides[z.zone] ? null : `${first} ${z.n}개국`
    r.subSingle = restSingle.join(' · ')
    r.labelSource = overrides[z.zone] ? 'override' : z.forced ? 'auto-discriminated' : 'auto-rarity'
  }
}

// 혼동쌍이 결과적으로 갈렸는지 확인. 앞자리(가장 먼저 읽히는 자리)가 같으면 실패.
for (const { x, y } of pairs) {
  const [xf] = x.rows[0].reps
  const [yf] = y.rows[0].reps
  if (xf === yf) {
    for (const r of [...x.rows, ...y.rows]) {
      r.review.push(
        `${x.zone}/${y.zone} 가 대표국 앞자리(${xf})를 공유 — 120px 에서 구별 불가. label-overrides.json 으로 지정 필요`,
      )
    }
  } else if (x.rows[0].reps.some((c) => y.rows[0].reps.includes(c))) {
    for (const r of [...x.rows, ...y.rows]) {
      r.review.push(
        `${x.zone}/${y.zone} 라벨에 같은 국가가 함께 등장 — 앞자리는 다르므로 구별은 되나 확인 권장`,
      )
    }
  }
}

// 라벨 충돌 검사 — 보고서 「공용 이미지」 리스크. 같은 라벨 + 같은 플랜유형이면
// 120px 에서 두 상품이 구별되지 않아 서로를 잠식한다.
const seen = new Map()
for (const r of rows) {
  // 대표국 조합이 같으면 숫자 한 글자만 다른 라벨이 되어 120px 에서 구별되지 않는다.
  const key = r.reps ? `${r.reps.join('|')}|${r.planType}` : `${r.label}|${r.planType}`
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
  produceCount: rows.filter((r) => r.produce).length,
  holdCount: rows.filter((r) => !r.produce).length,
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
      `제작 대상 ${out.produceCount}장 · 보류 ${out.holdCount}장(종량제)\n` +
      `우선순위: top10 ${out.byTier.top10} · top20 ${out.byTier.top20} · 이후 ${out.byTier.tail} · 실적없음 ${out.byTier.none}`,
  )
}
console.log(`\n검토 필요 ${flagged.length}건:`)
for (const r of flagged) {
  console.log(`  ${r.sku.padEnd(8)} 「${r.label}」`)
  for (const m of r.review) console.log(`           - ${m}`)
}
