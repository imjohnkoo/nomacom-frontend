<template>
  <div class="n-line-chart">
    <div v-if="isEmpty" class="n-chart-empty">
      <svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        aria-hidden="true"
      >
        <path d="M3 3v18h18M7 16l4-4 4 4 4-4" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <span>{{ emptyText }}</span>
    </div>

    <!-- role=status + aria-busy — 스켈레톤은 «시각적 자리표시»라 낭독기에는 아무것도
         전달되지 않는다. 그러면 로딩 중인지 빈 차트인지 구분할 수 없다. -->
    <div
      v-else-if="loading"
      class="n-chart-loading"
      role="status"
      aria-busy="true"
      :style="{ height: `${height}px` }"
    >
      <span class="n-chart-sr-only">{{ loadingLabel }}</span>
    </div>

    <div v-else class="n-chart-plot" role="img" :aria-label="chartAriaLabel">
      <!-- ⚠️ LineChart 가 아니라 AreaChart + hideArea 다. vue-chrts 의 LineChart 는
           crosshair 툴팁(한 x 위치의 모든 계열을 한 번에 보여주는 것)이 없어서
           계열별로 따로 떠버린다. 실수로 LineChart 로 바꾸면 툴팁이 퇴화한다. -->
      <AreaChart
        :data="data"
        :height="height"
        :y-domain="yDomain"
        :padding="internalPadding"
        :categories="categories"
        :x-formatter="internalXFormatter"
        :y-formatter="internalYFormatter"
        :curve-type="internalCurveType"
        :stacked="stacked"
        :hide-area="true"
        :line-width="lineWidth"
        :y-grid-line="yGridLine"
        :x-grid-line="xGridLine"
        :hide-legend="hideLegend"
        :hide-tooltip="hideTooltip"
        :legend-position="internalLegendPosition"
        :y-label="yLabel"
        :x-label="xLabel"
        :y-num-ticks="yNumTicks"
        :x-num-ticks="xNumTicks"
        :marker-config="internalMarkerConfig"
        :duration="animated === false ? 0 : 600"
      >
        <template #tooltip="{ values }">
          <slot name="tooltip" :values="values">
            <NChartTooltip
              v-if="values"
              :title="tooltipTitle(values)"
              :rows="tooltipRows(values)"
            />
          </slot>
        </template>
      </AreaChart>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { AreaChart } from 'vue-chrts'
import NChartTooltip from '../NChartTooltip.vue'
import {
  seriesToCategories,
  mapCurveType,
  mapLegendPosition,
  normalizePadding,
  resolveColor,
  buildChartAriaLabel,
  buildTooltipTitle,
  buildTooltipRows,
} from '../utils'
import type { NLineChartProps } from '../types'

const props = withDefaults(defineProps<NLineChartProps>(), {
  height: 300,
  hideLegend: false,
  hideTooltip: false,
  yGridLine: true,
  xGridLine: false,
  yNumTicks: 4,
  stacked: false,
  animated: true,
  curveType: 'smooth',
  lineWidth: 2,
  showDots: false,
  loading: false,
  loadingLabel: '차트를 불러오는 중',
  emptyText: '데이터가 없습니다',
})

const isEmpty = computed(() => !props.data || props.data.length === 0)

const categories = computed(() => seriesToCategories(props.series))

const chartAriaLabel = computed(() => buildChartAriaLabel('선 차트', props))

// Tooltip: 공용 헬퍼 + NChartTooltip 으로 통일 (기본 JSON 덤프 대체)
const tooltipTitle = (values: Record<string, unknown>) => buildTooltipTitle(values, props)
const tooltipRows = (values: Record<string, unknown>) =>
  buildTooltipRows(values, categories.value, props.formatter)

const internalXFormatter = (tick: number): string => {
  const raw = props.data[tick]?.[props.xKey]
  const label = String(raw ?? '')
  return props.xFormatter ? props.xFormatter(label, tick) : label
}

const internalYFormatter = props.formatter
  ? (tick: number): string => props.formatter!(tick)
  : undefined

const internalPadding = computed(() => normalizePadding(props.padding))
const internalCurveType = computed(() => mapCurveType(props.curveType))
const internalLegendPosition = computed(() => mapLegendPosition(props.legendPosition))

const internalMarkerConfig = computed(() => {
  if (!props.showDots) return undefined
  return {
    id: 'n-line-markers',
    config: Object.fromEntries(
      props.series.map((s, i) => [
        s.key,
        { type: 'circle' as const, size: 5, strokeWidth: 2, color: resolveColor(s.color, i) },
      ]),
    ),
  }
})
</script>

<style scoped>
.n-line-chart {
  position: relative;
  width: 100%;
  /* 자체 카드 스타일 제거 — 차트는 섹션/카드 안에 놓이므로 이중 아웃라인 방지 */
  background: transparent;
  padding: 0;
  box-sizing: border-box;
  font-family: var(
    --n-font-family-sans,
    'Pretendard',
    -apple-system,
    BlinkMacSystemFont,
    'Apple SD Gothic Neo',
    'Segoe UI',
    'Noto Sans KR',
    sans-serif
  );
}

/* vue-chrts 가 렌더하는 SVG 내부는 이 SFC 의 scope 속성을 받지 못한다 → :deep() 필수 */

/* Axis labels */
.n-line-chart :deep(.tick text),
.n-line-chart :deep(.axis text) {
  font-size: var(--n-font-size-xs, 0.75rem);
  fill: var(--n-color-neutral-500, #737373);
  font-family: inherit;
}

/* Grid lines */
.n-line-chart :deep(.grid line),
.n-line-chart :deep(.grid path) {
  stroke: var(--n-color-neutral-200, #e5e5e5);
}

/* Tooltip 껍데기 (내부 마크업은 NChartTooltip) */
.n-line-chart :deep([class*='tooltip']:not([class*='n-chart-tooltip'])),
.n-line-chart :deep([class*='Tooltip']:not([class*='n-chart-tooltip'])) {
  background: var(--n-color-white, #ffffff) !important;
  border: var(--n-border-width-1, 1px) solid var(--n-color-neutral-200, #e5e5e5) !important;
  border-radius: var(--n-radius-lg, 0.5rem) !important;
  box-shadow: var(--n-shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1)) !important;
  padding: var(--n-spacing-2, 0.5rem) var(--n-spacing-3, 0.75rem) !important;
  font-size: var(--n-font-size-xs, 0.75rem) !important;
  font-family: inherit !important;
  color: var(--n-color-neutral-800, #262626) !important;
}

/* Legend */
.n-line-chart :deep([class*='legend']),
.n-line-chart :deep([class*='Legend']) {
  font-size: var(--n-font-size-sm, 0.875rem);
  color: var(--n-color-neutral-600, #525252);
  font-family: inherit;
}

/* 범례 중앙 정렬 (vue-chrts 2.1.x 는 corner 위치만 지원 — 하단 중앙 표준은 CSS 로) */
.n-line-chart :deep([class*='bullet-legend']) {
  justify-content: center;
  /* 차트 본체와의 간격 */
  margin: var(--n-spacing-4, 1rem) auto 0;
}

/* Empty state */
.n-line-chart .n-chart-empty {
  display: flex;
  /* 래퍼 보더 제거 후에도 플레이스홀더 영역이 읽히도록 대시 프레임 */
  border: var(--n-border-width-1, 1px) dashed var(--n-color-neutral-300, #d4d4d4);
  border-radius: var(--n-radius-xl, 0.75rem);
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--n-spacing-3, 0.75rem);
  height: 12.5rem;
  color: var(--n-color-neutral-400, #a3a3a3);
  font-size: var(--n-font-size-sm, 0.875rem);
}

/* loading — 축·라벨 없이 플롯 자리만 채우는 스켈레톤 */
.n-line-chart .n-chart-loading {
  width: 100%;
  border-radius: var(--n-radius-lg, 0.5rem);
  background: var(--n-color-neutral-200, #e5e5e5);
  animation: n-chart-skeleton-pulse 1.4s ease-in-out infinite;
}

/* 시각적으로 감추되 접근성 트리에는 남긴다 (styles/base.css 의 .n-sr-only 와 동일 규칙) */
.n-line-chart .n-chart-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

@keyframes n-chart-skeleton-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.55;
  }
}

@media (prefers-reduced-motion: reduce) {
  .n-line-chart .n-chart-loading {
    animation: none;
  }
}
</style>
