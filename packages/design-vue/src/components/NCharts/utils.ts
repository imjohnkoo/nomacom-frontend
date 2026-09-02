// NCharts — shared utilities
import { CurveType, LegendPosition } from 'vue-chrts/enums'
import type { NChartSeries, NChartCurveType, NChartLegendPosition } from './types'

/* ─────────────────────────────────────────────────────────────────────────────
   차트 팔레트 — 도출 근거 (2026-08-20, nomacom 보라 #6239ff 기준 신규 도출)

   ⚠️ m8 팔레트(청록 212° 축)를 값 그대로 가져오지 않았다. 브랜드가 다르면 1번 슬롯이
      브랜드를 못 가리키고, 나머지 슬롯도 그 1번에 맞춰 배치된 것이라 통째로 무의미해진다.
      가져온 것은 **방법론**이다: ① 색상만 벌리지 말고 «명도»도 함께 벌린다 ② 색각 이상
      시뮬레이션으로 인접쌍 분리도를 실측한다 ③ 흰 배경 대비를 슬롯마다 확인한다.

   정의의 정본은 `packages/design-tokens/src/colors.json` 의 `chart` / `chart-seq` 이고,
   아래 hex 는 tokens.css 미로드 환경용 fallback 이다.
   ⚠️ 두 곳의 값이 어긋나면 앱마다 다른 색이 나온다 — 반드시 함께 고칠 것.
   (m8 은 팔레트를 design-vue 의 palette.css 에 뒀는데 그건 잘못된 위치였다. 토큰은
    design-tokens 가 소유해야 mobile/RN·Tailwind 브리지가 같은 값을 볼 수 있다.)

   ── 측정 방법 ────────────────────────────────────────────────────────────────
   ΔE 는 OKLab 유클리드 거리 ×100. 색각 이상은 Machado–Oliveira–Fernandes (2009)
   severity 1.0 시뮬레이션(protan/deutan/tritan). 대비는 WCAG 비율, 서피스는 흰색.
   임계: 인접 CVD ΔE ≥ 8, 인접 정상시야 ΔE ≥ 15, 마크 대비 ≥ 3:1.

   ── 카테고리형 5색: 왜 이 색들인가 ──────────────────────────────────────────
   슬롯 1 은 브랜드 primary-500 (#6239ff, OKLCH L .533 C .268 H 281.8°) 로 고정한다.
   나머지 4색은 「브랜드 보라에서 가장 멀되 서로도 먼」 조합을 색상환 + 명도 두 축에서
   동시에 탐색해 골랐다. 후보 격자(오렌지·청록·와인·앰버 각 5단계 × 순열 24가지)를
   전수 검증해 **인접 CVD 최솟값이 최대**가 되는 조합·순서를 취했다.

     슬롯  이름      hex       OKLCH (L / C / H)      흰 배경 대비
       1   보라      #6239ff   .533 / .268 / 281.8°     5.92:1   ← 브랜드
       2   오렌지    #e2670f   .654 / .175 /  47.7°     3.40:1
       3   청록      #12a394   .644 / .112 / 183.3°     3.14:1
       4   와인      #9d0f3a   .450 / .171 /  12.5°     8.19:1
       5   앰버      #b07800   .615 / .129 /  76.2°     3.80:1

   검증 결과 (인접쌍 = 누적막대·라인·도넛이 실제로 맞닿는 쌍):
     · 명도 밴드   PASS — 5색 전부 OKLCH L 0.43~0.77 안
     · 채도 하한   PASS — 5색 전부 C ≥ 0.10 (이하로 내려가면 회색으로 읽혀 식별이 죽는다)
     · CVD 분리    PASS — 최악 인접쌍 오렌지↔청록 ΔE 15.4 (protan) · tritan 16.7
     · 정상 시야   PASS — 최악 인접쌍 와인↔앰버 ΔE 23.2
     · 대비        PASS — **5색 전부 3:1 이상**

   ⭐ m8 대비 개선점: m8 슬롯 5(#dd9314)는 흰 배경 대비 2.54 라 「값 라벨 필수」라는
      영구 각주를 달고 살았다. 여기서는 같은 자리를 앰버 #b07800 (3.80:1) 로 눌러
      **얇은 선·작은 도넛 조각도 라벨 없이 보인다**. 대비를 위해 명도를 낮추면 오렌지와
      붙는 문제가 생기는데, 그건 아래 「순서」로 푼다.

   ⛔ **슬롯 2(오렌지)와 슬롯 5(앰버)는 절대 인접시키지 마라.**
      이 둘은 protan ΔE 0.4 · 정상시야 ΔE 9.5 로 사실상 같은 색이다. 색상환에서 28.5°
      밖에 안 떨어져 있는데 둘 다 필요한 이유는, 5색을 흰 배경에서 전부 3:1 이상으로
      유지하려면 따뜻한 쪽에 두 자리를 쓸 수밖에 없기 때문이다. 대신 **순서**로 격리했다 —
      배열 순서대로 배정하는 한(1→2→3→4→5) 둘은 절대 이웃이 되지 않는다.
      ⇒ 그래서 **슬롯을 건너뛰거나 재정렬하지 마라.** 시리즈가 3개면 1·2·3 을 쓴다.
        「2번 색이 예뻐서 첫 시리즈에 쓰고 5번을 두 번째로」 같은 짓을 하면 팔레트가 깨진다.

   ⚠️ **산점도·버블·코로플레스·small multiples 는 4색까지만.**
      이런 차트는 아무 두 마크나 나란히 놓일 수 있어 「인접쌍」이 아니라 「전체쌍」이
      기준이 된다. 앞 4색(보라·오렌지·청록·와인)은 전체쌍 검증도 통과한다
      (최악 ΔE 15.4 CVD / 23.0 정상). 5번째를 넣는 순간 오렌지↔앰버가 같은 화면에
      올라 무너진다 — 5번째가 필요하면 항목을 접거나(상위 4 + 「기타」) 차트를 나눈다.

   ⛔ **6번째 색을 추가하지 마라.** 상위 5 + 「기타」로 접거나 차트를 나눈다.
      색을 늘리면 인접 구분이 무너진다 (m8 에서 실측으로 확인된 규칙, 여기서도 동일).

   ⚠️ 상태색(success/warning/error)과 분리된 «데이터 전용» 팔레트다. 시리즈가 «좋다/나쁘다»를
      의미할 때(실패율 등)만 상태색을 쓰고, 그냥 「4번 계열」이면 여기 색을 쓴다 — 섞지 말 것.
   ⚠️ 브랜드 조정이 과거 차트 해석을 흔들면 안 되므로 primary 토큰을 **참조하지 않고**
      값을 복사해 고정한다. 슬롯 1 이 지금 primary-500 과 같은 값인 것은 «현재 시점의
      의도적 일치»이지 자동 연동이 아니다. 브랜드 hue 를 돌릴 일이 생기면 그때 여기 값을
      의도적으로 한 번 갱신하고, 구분성을 위 검증으로 재확인한 뒤 커밋할 것.
   ───────────────────────────────────────────────────────────────────────────── */
export const CHART_DEFAULT_COLORS = [
  'var(--n-color-chart-1, #6239ff)', // 보라 281.8° — 브랜드
  'var(--n-color-chart-2, #e2670f)', // 오렌지 47.7°
  'var(--n-color-chart-3, #12a394)', // 청록 183.3°
  'var(--n-color-chart-4, #9d0f3a)', // 와인 12.5°
  'var(--n-color-chart-5, #b07800)', // 앰버 76.2° — ⛔ 슬롯 2 와 인접 금지
]

/* 순차형 — 순서 있는 계열(라이프사이클·퍼널·기간·등급)용.
   브랜드 보라 램프(primary 300·400·500·700·900)를 그대로 쓴 **단일 색조 명도 계단**이다.

   ⭐ 순서가 있는 데이터에 위 카테고리형을 쓰지 마라. 카테고리형은 «순서 없음»을 뜻하는
      기호라, 퍼널 단계에 쓰면 독자가 색에서 순서를 읽지 못하고 범례를 왕복하게 된다.

   왜 600 과 800 을 건너뛰었나: OKLCH 명도차가 500→600 은 0.057, 700→800 은 0.064 로
   계단이 눈에 안 잡힌다(계단 최소 ΔL 0.06). 실제로 쓰는 5칸은 아래처럼 벌어진다.

     칸  hex       OKLCH L   앞칸과의 ΔL   흰 배경 대비
      1  #a78bff    .712        —            2.70:1   ← 가장 밝은 칸도 2:1 이상
      2  #8761ff    .616      .096           4.05:1
      3  #6239ff    .533      .083           5.92:1
      4  #3f1cc0    .411      .122           9.82:1
      5  #1f0c6e    .274      .137          15.72:1

   검증: 명도 단조 PASS · 인접 ΔL 전부 ≥ .06 PASS · 밝은 끝 대비 2.70:1 PASS ·
         단일 색조 PASS (hue 폭 14°).
   ⭐ 색상이 하나뿐이라 **색각 이상의 영향을 원리적으로 받지 않는다** — protan/deutan 에서도
      명도 순서가 그대로 남는다. 순서형에 카테고리형을 쓰면 이 성질을 통째로 버리는 셈이다. */
export const CHART_SEQUENTIAL_COLORS = [
  'var(--n-color-chart-seq-1, #a78bff)',
  'var(--n-color-chart-seq-2, #8761ff)',
  'var(--n-color-chart-seq-3, #6239ff)',
  'var(--n-color-chart-seq-4, #3f1cc0)',
  'var(--n-color-chart-seq-5, #1f0c6e)',
]

export function resolveColor(color: string | undefined, index: number): string {
  return color ?? CHART_DEFAULT_COLORS[index % CHART_DEFAULT_COLORS.length]
}

export function seriesToCategories(
  series: NChartSeries[],
): Record<string, { name: string; color: string }> {
  return Object.fromEntries(
    series.map((s, i) => [s.key, { name: s.label ?? s.key, color: resolveColor(s.color, i) }]),
  )
}

export function mapCurveType(curve: NChartCurveType | undefined): CurveType {
  switch (curve) {
    case 'linear':
      return CurveType.Linear
    case 'step':
      return CurveType.Step
    default:
      return CurveType.MonotoneX // 'smooth'
  }
}

export function mapLegendPosition(pos: NChartLegendPosition | undefined): LegendPosition {
  switch (pos) {
    case 'top-left':
      return LegendPosition.TopLeft
    case 'top-right':
      return LegendPosition.TopRight
    case 'bottom-left':
      return LegendPosition.BottomLeft
    // 기본: 하단 — 범례가 데이터 위를 덮지 않도록 (표준 확정)
    default:
      return LegendPosition.BottomRight
  }
}
/* ⚠️ 코너 4종만 노출하는 이유: vue-chrts 2.2 부터 `Top/BottomCenter` 가 생겼지만
   peer 범위(`^2.1.4`)가 아직 center 가 없는 2.1.x 를 허용한다. 2.1.x 에서
   `LegendPosition.BottomCenter` 는 undefined 라 범례가 통째로 사라진다.
   하단 «중앙» 정렬은 각 차트 CSS 의 `[class*='bullet-legend'] { justify-content: center }`
   가 처리하므로 기능 손실은 없다. peer 하한을 2.2 로 올리는 날 enum 을 열 것. */

// vue-chrts 의 padding prop 은 4면 전부 필수인 완전형만 받는다(부분형은 타입 에러이고,
// 런타임 default({top:5,…})도 prop 이 undefined 일 때만 적용돼 부분형은 나머지 면이
// undefined 로 뚫린다). N 쪽 공개 타입은 부분형(2패널 x축 정렬 시 left 만 고정하는
// 용례)을 유지하고, 여기서 빠진 면을 라이브러리 기본값 5 로 채워 완전형으로 넘긴다.
export function normalizePadding(
  padding: { top?: number; right?: number; bottom?: number; left?: number } | undefined,
): { top: number; right: number; bottom: number; left: number } | undefined {
  if (!padding) return undefined
  return {
    top: padding.top ?? 5,
    right: padding.right ?? 5,
    bottom: padding.bottom ?? 5,
    left: padding.left ?? 5,
  }
}

// ---- 접근성 요약 ----
// 차트는 순수 시각 요소다. SVG 안에는 낭독기가 의미를 붙일 수 있는 것이 하나도 없어서
// 아무 처리도 하지 않으면 «그래픽» 한 마디로 끝난다. 그래서 플롯 래퍼에 role="img" 를
// 걸고 여기서 만든 문장을 aria-label 로 준다.
export function buildChartAriaLabel(
  kind: string,
  opts: {
    data: Record<string, unknown>[]
    xKey: string
    series: NChartSeries[]
    ariaLabel?: string
  },
): string {
  if (opts.ariaLabel) return opts.ariaLabel
  const names = opts.series.map((s) => s.label ?? s.key)
  const first = String(opts.data[0]?.[opts.xKey] ?? '')
  const last = String(opts.data[opts.data.length - 1]?.[opts.xKey] ?? '')
  const range = first && last && first !== last ? `, ${first}부터 ${last}까지` : ''
  return `${kind}. 계열 ${names.length}개: ${names.join(', ')}. 데이터 ${opts.data.length}개${range}`
}

// ---- Tooltip (모든 차트 공통 — NChartTooltip 과 함께 사용) ----

export interface NChartTooltipRow {
  key: string
  name: string
  color: string | undefined
  value: string
}

// Unovis 는 datum 을 래핑함: StackedBar → { datum: row, index, ... }, Area(crosshair) → row 자체.
export function resolveTooltipDatum(
  values: Record<string, unknown> | undefined,
): Record<string, unknown> {
  const d = values?.datum
  if (d && typeof d === 'object') return d as Record<string, unknown>
  return values ?? {}
}

export function buildTooltipTitle(
  values: Record<string, unknown>,
  opts: {
    data: Record<string, unknown>[]
    xKey: string
    xFormatter?: (label: string, index: number) => string
  },
): string {
  const row = resolveTooltipDatum(values)
  const raw = row[opts.xKey]
  const label = String(raw ?? '')
  if (!opts.xFormatter) return label
  const idx = opts.data.findIndex((d) => d[opts.xKey] === raw)
  return opts.xFormatter(label, idx < 0 ? 0 : idx)
}

export function buildTooltipRows(
  values: Record<string, unknown>,
  cats: Record<string, { name: string; color?: string }>,
  formatter?: (value: number) => string,
): NChartTooltipRow[] {
  return Object.entries(resolveTooltipDatum(values))
    .filter(([k]) => k in cats)
    .map(([k, v]) => ({
      key: k,
      name: cats[k]?.name ?? k,
      color: cats[k]?.color,
      value: formatter ? formatter(Number(v)) : String(v ?? '-'),
    }))
}
