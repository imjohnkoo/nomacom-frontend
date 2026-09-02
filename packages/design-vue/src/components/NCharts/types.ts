// NCharts — shared types

/*
 * ⛔ **이중축(y축 2개) 차트는 여기서 만들 수 없고, 만들어서도 안 된다.**
 *
 * ① 기술적으로 막혀 있다 (2026-08-16 실측). 하위 `@unovis/ts` 의 XYContainer 는 축을
 *    **타입당 단일 슬롯**(`config.xAxis` / `config.yAxis`)으로 들고 있어서, `VisAxis type="y"`
 *    를 둘 두면 **뒤엣것이 앞엣것을 덮는다**. 헤드리스 렌더로 재현 시 축이 3개가 아니라 2개만
 *    그려지고 좌축 라벨이 통째로 사라졌다. `@unovis/ts` 에 `Position.Right`·`tickValues` 가
 *    있어도 **Vue 래퍼 경로로는 불가능**하다 — 이 사실을 모르면 의존성만 추가했다가 되돌리게 된다.
 *
 * ② 애초에 권장되지 않는 형태다. 두 축의 정렬이 임의라 **데이터에 없는 상관을 차트가 발명한다** —
 *    우축 최대를 3/5/10/16% 로 바꾸면 같은 데이터가 「불안정」→「상관 있음」→「무관」→「안정」으로
 *    읽힌다.
 *
 * ✅ 대신: **2패널**(차트 2개를 세로로 쌓고 x축 정렬) — 아래 `yDomain` + `padding` 이 그것을 위해
 *    열려 있다. 또는 small multiples, 또는 공통 기준 지수화(=100 at t0).
 *
 * 그럼에도 특정 화면이 이중축을 택했다면 **앱 로컬 컴포넌트**로 두고 DS 로 승격하지 않는다
 * (선례: m8 admin `SendingComboChart.vue` — SVG 직접 렌더, 우축은 데이터가 아니라 고정 계단으로
 * 결정, 「다른 기간과 곡선 높이를 비교하지 말라」 캡션 상시 노출).
 */

export interface NChartSeries {
  key: string
  label?: string
  color?: string
}

export type NChartLegendPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
export type NChartCurveType = 'linear' | 'smooth' | 'step'

export interface NChartBaseProps {
  data: Record<string, unknown>[]
  xKey: string
  series: NChartSeries[]
  height?: number
  /**
   * ⚠️ 범례를 끄면 시리즈를 **색으로만** 구분하게 된다 — 색각 이상 사용자에게는 식별 수단이
   * 사라진다. 시리즈가 1개라 제목이 이미 계열을 지목하는 경우에만 켤 것.
   */
  hideLegend?: boolean
  hideTooltip?: boolean
  legendPosition?: NChartLegendPosition
  yLabel?: string
  xLabel?: string
  yNumTicks?: number
  xNumTicks?: number
  yGridLine?: boolean
  xGridLine?: boolean
  formatter?: (value: number) => string
  xFormatter?: (label: string, index: number) => string
  stacked?: boolean
  animated?: boolean
  /**
   * y축 도메인 고정 `[min, max]`. 각 항목에 `undefined` 를 주면 그쪽만 자동.
   *
   * ⭐ **비율 계열에는 사실상 필수**다. 자동 스케일이면 기간을 바꿀 때마다 진폭이 달라져
   * 기간 간 비교가 깨지고, 평시 1.8% 가 꼭대기까지 차올라 정상을 이상으로 오독하게 만든다.
   * 예: 실패율 패널 `:y-domain="[0, 5]"`.
   *
   * ⚠️ `NBarChart` 는 미지원이다 — m8 조사 시점(vue-chrts 2.1.x)의 BarChart 에는 이 prop 이
   * 없었다 (`yDomainLine` 은 축선 표시 여부라 다른 것). vue-chrts 2.2.x 부터는 BarChart 에도
   * `yDomain` 이 생겼지만, 이 패키지의 peer 범위(`^2.1.4`)가 아직 2.1.x 를 허용하므로
   * 통과시키지 않는다. peer 하한을 2.2 로 올리는 날 함께 열 것.
   */
  yDomain?: [number | undefined, number | undefined]
  /**
   * 플롯 여백. **두 차트를 세로로 쌓아 x축을 맞출 때 필요하다** — y축 눈금 라벨 폭이
   * 다르면(`60k` vs `5%`) 플롯 시작점이 어긋나므로 `left` 를 같은 값으로 고정한다.
   */
  padding?: { top?: number; right?: number; bottom?: number; left?: number }
  /** true 면 축·라벨은 유지하고 플롯 영역만 스켈레톤 (NDonutChart 와 동일 규약) */
  loading?: boolean
  /** 스켈레톤이 낭독기에 읽히는 문구 (NKpi/NTableSkeleton 과 동일 규약) */
  loadingLabel?: string
  /**
   * 차트를 대신 읽어줄 요약 문구 (`role="img"` 의 `aria-label`).
   * 생략하면 「차트 종류 · 계열 이름 · 데이터 개수 · x 범위」로 자동 생성한다.
   * 낭독기에는 SVG 내부가 통째로 의미 없는 노드 더미로만 전달되므로 이 요약이 유일한 통로다.
   */
  ariaLabel?: string
  /** 데이터가 없을 때 표시할 문구 */
  emptyText?: string
}

export interface NAreaChartProps extends NChartBaseProps {
  curveType?: NChartCurveType
  hideArea?: boolean
  lineWidth?: number
  gradientStops?: Array<{ offset: string; stopOpacity: number }>
}

export interface NLineChartProps extends NChartBaseProps {
  curveType?: NChartCurveType
  lineWidth?: number
  showDots?: boolean
}

export interface NBarChartProps extends NChartBaseProps {
  orientation?: 'vertical' | 'horizontal'
  barPadding?: number
  groupPadding?: number
  radius?: number
}

export interface NDonutChartProps {
  data: Record<string, unknown>[]
  valueKey: string
  labelKey: string
  /** labelKey 값(key)에 표시 라벨/색을 매핑 — 다른 차트와 동일한 API. colors 보다 우선 */
  series?: NChartSeries[]
  colors?: string[]
  legendPosition?: NChartLegendPosition
  height?: number
  /** ⚠️ 범례를 끄면 조각을 색으로만 구분하게 된다. `variant="list"` 는 값·비중이 글자로
   *  나오므로 내장 범례를 꺼도 안전하다 (그래서 list 는 자동으로 끈다). */
  hideLegend?: boolean
  hideTooltip?: boolean
  /** true 면 툴팁 값 옆에 전체 대비 비중(%)을 함께 표시 */
  tooltipPercent?: boolean
  formatter?: (value: number) => string
  arcWidth?: number
  radius?: number
  padAngle?: number
  animated?: boolean
  /**
   * 표시 변형.
   * - default: 도넛 + 내장 범례
   * - list: 내장 범례 대신 도넛 하단에 값·비중이 포함된 리스트 범례
   */
  variant?: 'default' | 'list'
  /** 좌상단 타이틀 (섹션 타이틀 양식) — 지정 시 변형과 무관하게 헤더 렌더 */
  title?: string
  /** 타이틀 옆 뮤트 서브텍스트 (예: '오늘') */
  subtitle?: string
  /** true 면 타이틀/서브타이틀 유지 + 차트 회색 플레이스홀더 + (list) 리스트 스켈레톤 */
  loading?: boolean
  /** 스켈레톤이 낭독기에 읽히는 문구 */
  loadingLabel?: string
  /** 도넛을 대신 읽어줄 요약 문구. 생략하면 항목·비중으로 자동 생성 */
  ariaLabel?: string
  /** 데이터가 없을 때 표시할 문구 */
  emptyText?: string
}
