// @imjohnkoo/design-vue/charts — 차트 컴포넌트 엔트리 (vue-chrts 필요)
//
// 별도 서브엔트리인 이유: `vue-chrts` 는 optional peer 다. 메인 엔트리(`.`)에 섞으면
// 차트를 쓰지 않는 소비자(design-showcase, mobile 웹뷰 등)까지 vue-chrts 를 설치해야 한다.
// 사용: `import { NLineChart } from '@imjohnkoo/design-vue/charts'`
export {
  NAreaChart,
  NLineChart,
  NBarChart,
  NDonutChart,
  NChartTooltip,
} from './components/NCharts'

/* 팔레트 상수 — 앱이 계열 색을 직접 지정할 때 import 한다.
   ⛔ 앱에 hex 를 다시 박지 마라. 순서 있는 계열이면 SEQUENTIAL, 무관하면 DEFAULT.
   (도출 근거와 검증 수치는 `components/NCharts/utils.ts` 상단 주석에 있다) */
export { CHART_DEFAULT_COLORS, CHART_SEQUENTIAL_COLORS } from './components/NCharts'
export type {
  NChartSeries,
  NChartBaseProps,
  NAreaChartProps,
  NLineChartProps,
  NBarChartProps,
  NDonutChartProps,
  NChartLegendPosition,
  NChartCurveType,
  NChartTooltipRow,
} from './components/NCharts'
