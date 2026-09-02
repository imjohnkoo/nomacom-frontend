// NCharts — component and type exports
//
// ⚠️ 이 barrel 은 루트 `src/components/index.ts` 에 «절대» 재수출하지 않는다.
//    차트는 `vue-chrts` (optional peer) 를 필요로 하므로 메인 번들에 섞이면
//    vue-chrts 를 설치하지 않은 소비자(design-showcase 등)가 해석 불가 import 를 만난다.
//    노출 경로는 서브엔트리 `@imjohnkoo/design-vue/charts` 하나뿐이다.
//    같은 이유로 `src/nuxt-components.ts` (Nuxt auto-import 목록) 에도 넣지 않는다.
export { default as NAreaChart } from './NAreaChart/NAreaChart.vue'
export { default as NLineChart } from './NLineChart/NLineChart.vue'
export { default as NBarChart } from './NBarChart/NBarChart.vue'
export { default as NDonutChart } from './NDonutChart/NDonutChart.vue'
export { default as NChartTooltip } from './NChartTooltip.vue'

/* 팔레트 상수 — 앱이 계열 색을 직접 지정해야 할 때 이걸 import 한다.
   ⛔ 앱에 hex 를 다시 박지 마라(그렇게 「앱 로컬 팔레트」가 생겼다).
   순서 있는 계열이면 SEQUENTIAL, 무관한 항목이면 DEFAULT. */
export { CHART_DEFAULT_COLORS, CHART_SEQUENTIAL_COLORS } from './utils'
export type { NChartTooltipRow } from './utils'

export type {
  NChartSeries,
  NChartBaseProps,
  NAreaChartProps,
  NLineChartProps,
  NBarChartProps,
  NDonutChartProps,
  NChartLegendPosition,
  NChartCurveType,
} from './types'
