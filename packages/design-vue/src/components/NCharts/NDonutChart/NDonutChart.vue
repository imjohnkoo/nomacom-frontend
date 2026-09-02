<template>
  <div class="n-donut-chart" :class="{ 'n-donut-chart--list': isList }">
    <!-- 헤더 — 섹션 타이틀 양식 (좌상단) -->
    <div v-if="title" class="n-donut-chart__head">
      <span class="n-donut-chart__title">{{ title }}</span>
      <span v-if="subtitle" class="n-donut-chart__subtitle">{{ subtitle }}</span>
    </div>

    <!-- loading: 헤더 유지 + 회색 도넛 플레이스홀더 + (list) 리스트 스켈레톤.
         role=status + aria-busy — 스켈레톤은 «시각적 자리표시»라 낭독기에는 아무것도
         전달되지 않는다. 그러면 로딩 중인지 빈 차트인지 구분할 수 없다. -->
    <template v-if="loading">
      <div class="n-donut-chart__placeholder" role="status" aria-busy="true">
        <span class="n-chart-sr-only">{{ loadingLabel }}</span>
        <span
          class="n-donut-chart__placeholder-ring"
          aria-hidden="true"
          :style="{
            width: `${height}px`,
            height: `${height}px`,
            borderWidth: `${arcWidth}px`,
          }"
        />
      </div>
      <ul v-if="isList" class="n-donut-chart__list" aria-hidden="true">
        <li v-for="i in 4" :key="`sk-${i}`" class="n-donut-chart__list-item">
          <span class="n-donut-chart__chip n-donut-chart__skeleton-chip" />
          <span
            class="n-donut-chart__skeleton-bar"
            :style="{ width: `${[96, 72, 112, 64][i - 1]}px` }"
          />
          <span class="n-donut-chart__skeleton-bar n-donut-chart__skeleton-bar--end" />
        </li>
      </ul>
    </template>

    <div v-else-if="isEmpty" class="n-chart-empty">
      <svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="4" />
      </svg>
      <span>{{ emptyText }}</span>
    </div>

    <!-- role=img — SVG 내부는 낭독기에 의미 없는 노드 더미로만 전달되므로
         도넛 전체를 하나의 그림으로 보고 항목·비중 요약 문장을 준다.
         (variant="list" 의 리스트 범례는 이 래퍼 «밖»에 둔다 — 값이 글자로 남아야
          낭독기가 표 대체 경로로 읽을 수 있다) -->
    <div v-else class="n-chart-plot" role="img" :aria-label="chartAriaLabel">
      <DonutChart
        :data="numericData"
        :height="height"
        :categories="categories"
        :radius="radius"
        :arc-width="arcWidth"
        :pad-angle="padAngle"
        :hide-legend="isList ? true : hideLegend"
        :hide-tooltip="hideTooltip"
        :legend-position="internalLegendPosition"
        :duration="animated === false ? 0 : 600"
      >
        <template #default>
          <slot name="center">
            <div class="n-donut-chart__center">
              <div class="n-donut-chart__total">{{ formattedTotal }}</div>
              <div class="n-donut-chart__label">합계</div>
            </div>
          </slot>
        </template>
        <template #tooltip="{ values }">
          <slot name="tooltip" :values="values">
            <NChartTooltip v-if="values" :rows="tooltipRows(values)" />
          </slot>
        </template>
      </DonutChart>
    </div>

    <!-- list 변형 — 값·비중 포함 리스트 범례 -->
    <ul v-if="!loading && isList && !isEmpty" class="n-donut-chart__list">
      <li v-for="row in listRows" :key="row.key" class="n-donut-chart__list-item">
        <span class="n-donut-chart__chip" :style="{ background: row.color }" />
        <span class="n-donut-chart__name">{{ row.name }}</span>
        <span class="n-donut-chart__value">{{ row.value }}</span>
        <span class="n-donut-chart__pct">{{ row.pct }}%</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { DonutChart } from 'vue-chrts'
import NChartTooltip from '../NChartTooltip.vue'
import { mapLegendPosition, resolveColor, type NChartTooltipRow } from '../utils'
import type { NDonutChartProps } from '../types'

const props = withDefaults(defineProps<NDonutChartProps>(), {
  height: 300,
  hideLegend: false,
  hideTooltip: false,
  arcWidth: 40,
  radius: 4,
  padAngle: 0.02,
  animated: true,
  loading: false,
  loadingLabel: '차트를 불러오는 중',
  emptyText: '데이터가 없습니다',
})

/* 다른 차트와 동일하게 공용 매핑 사용 (기본: 하단) — TopRight 하드코딩 제거 */
const internalLegendPosition = computed(() => mapLegendPosition(props.legendPosition))

const numericData = computed(() => props.data.map((d) => Number(d[props.valueKey]) || 0))

const isEmpty = computed(
  () => numericData.value.length === 0 || numericData.value.every((v) => v === 0),
)

const categories = computed(() => {
  return Object.fromEntries(
    props.data.map((d, i) => {
      const key = String(d[props.labelKey] ?? `Item ${i}`)
      const s = props.series?.find((x) => x.key === key)
      const color = s?.color ?? props.colors?.[i] ?? resolveColor(undefined, i)
      return [key, { name: s?.label ?? key, color }]
    }),
  )
})

// Tooltip: DonutChart 는 values 를 { label: 카테고리 name, [name]: value } 로 전달 → 단일 행으로 통일
function tooltipRows(values: Record<string, unknown>): NChartTooltipRow[] {
  const label = String(values?.label ?? '')
  const raw = Number(values?.[label] ?? 0)
  const cat = Object.values(categories.value).find((c) => c.name === label)
  let value = props.formatter ? props.formatter(raw) : raw.toLocaleString()
  if (props.tooltipPercent && total.value > 0) {
    value += ` (${Math.round((raw / total.value) * 1000) / 10}%)`
  }
  return [
    {
      key: label,
      name: label,
      color: cat?.color,
      value,
    },
  ]
}

const total = computed(() => numericData.value.reduce((a, b) => a + b, 0))
const formattedTotal = computed(() =>
  props.formatter ? props.formatter(total.value) : total.value.toLocaleString(),
)

// list 변형 — 데이터 순서 그대로 리스트 범례 행 구성 (색/라벨은 categories 와 동일 해석)
const isList = computed(() => props.variant === 'list')

const listRows = computed(() => {
  if (!isList.value) return []
  return props.data.map((d, i) => {
    const key = String(d[props.labelKey] ?? `Item ${i}`)
    const cat = categories.value[key]
    const raw = Number(d[props.valueKey]) || 0
    return {
      key,
      name: cat?.name ?? key,
      color: cat?.color,
      value: props.formatter ? props.formatter(raw) : raw.toLocaleString(),
      pct: total.value ? Math.round((raw / total.value) * 1000) / 10 : 0,
    }
  })
})

// 낭독기용 요약 — 「항목 이름 비중%」 나열. 색만으로 조각을 구분하게 두지 않기 위한 최소선.
const chartAriaLabel = computed(() => {
  if (props.ariaLabel) return props.ariaLabel
  const parts = props.data.map((d, i) => {
    const key = String(d[props.labelKey] ?? `Item ${i}`)
    const raw = Number(d[props.valueKey]) || 0
    const pct = total.value ? Math.round((raw / total.value) * 1000) / 10 : 0
    return `${categories.value[key]?.name ?? key} ${pct}%`
  })
  return `도넛 차트. 합계 ${formattedTotal.value}. 항목 ${parts.length}개: ${parts.join(', ')}`
})
</script>

<style scoped>
.n-donut-chart {
  position: relative;
  width: 100%;
  /* 자체 카드 스타일 제거 — 차트는 섹션/카드 안에 놓이므로 이중 아웃라인 방지 */
  background: transparent;
  padding: 0;
  box-sizing: border-box;
  /* 세로 스택 — 부모가 높이를 주면(flex 카드 등) 빈 상태가 남은 공간을 채울 수 있게 */
  display: flex;
  flex-direction: column;
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

.n-donut-chart :deep(.tick text),
.n-donut-chart :deep(.axis text) {
  font-size: var(--n-font-size-xs, 0.75rem);
  fill: var(--n-color-neutral-500, #737373);
  font-family: inherit;
}

/* Tooltip 껍데기 (내부 마크업은 NChartTooltip) */
.n-donut-chart :deep([class*='tooltip']:not([class*='n-chart-tooltip'])),
.n-donut-chart :deep([class*='Tooltip']:not([class*='n-chart-tooltip'])) {
  background: var(--n-color-white, #ffffff) !important;
  border: var(--n-border-width-1, 1px) solid var(--n-color-neutral-200, #e5e5e5) !important;
  border-radius: var(--n-radius-lg, 0.5rem) !important;
  box-shadow: var(--n-shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1)) !important;
  padding: var(--n-spacing-2, 0.5rem) var(--n-spacing-3, 0.75rem) !important;
  font-size: var(--n-font-size-xs, 0.75rem) !important;
  font-family: inherit !important;
  color: var(--n-color-neutral-800, #262626) !important;
}

.n-donut-chart :deep([class*='legend']),
.n-donut-chart :deep([class*='Legend']) {
  font-size: var(--n-font-size-sm, 0.875rem);
  color: var(--n-color-neutral-600, #525252);
  font-family: inherit;
}

/* 범례 중앙 정렬 (vue-chrts 2.1.x 는 corner 위치만 지원 — 하단 중앙 표준은 CSS 로) */
.n-donut-chart :deep([class*='bullet-legend']) {
  justify-content: center;
  /* 차트 본체와의 간격 */
  margin: var(--n-spacing-4, 1rem) auto 0;
}

/* Hover: 마우스 올린 도넛 섹션 색을 진하게 — 시각 피드백 */
.n-donut-chart :deep([class*='segment']) {
  transition: filter 0.12s ease;
}
.n-donut-chart :deep([class*='segment']:hover) {
  filter: brightness(0.85);
}

/* Center slot */
.n-donut-chart__center {
  text-align: center;
  pointer-events: none;
}

.n-donut-chart__total {
  font-size: var(--n-font-size-2xl, 1.5rem);
  font-weight: var(--n-font-weight-bold, 700);
  color: var(--n-color-neutral-800, #262626);
  line-height: 1.2;
}

.n-donut-chart__label {
  font-size: var(--n-font-size-sm, 0.875rem);
  color: var(--n-color-neutral-500, #737373);
  margin-top: 2px;
}

/* Empty state */
.n-donut-chart .n-chart-empty {
  display: flex;
  /* 래퍼 보더 제거 후에도 플레이스홀더 영역이 읽히도록 대시 프레임 */
  border: var(--n-border-width-1, 1px) dashed var(--n-color-neutral-300, #d4d4d4);
  border-radius: var(--n-radius-xl, 0.75rem);
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--n-spacing-3, 0.75rem);
  /* 부모(flex 카드)가 높이를 주면 남은 공간을 채우고, 아니면 최소 200px */
  flex: 1 1 auto;
  height: auto;
  min-height: 12.5rem;
  color: var(--n-color-neutral-400, #a3a3a3);
  font-size: var(--n-font-size-sm, 0.875rem);
}

/* ── list 변형 — 좌상단 타이틀 + 값·비중 리스트 범례 ── */

.n-donut-chart__head {
  /* 타이틀 아래 서브타이틀 세로 스택 + 도넛과 넉넉한 간격 */
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
  margin-bottom: var(--n-spacing-5, 1.25rem);
}

.n-donut-chart__title {
  font-size: var(--n-font-size-lg, 1.125rem);
  font-weight: var(--n-font-weight-bold, 700);
  color: var(--n-color-neutral-900, #171717);
  line-height: 1.35;
}

.n-donut-chart__subtitle {
  font-size: var(--n-font-size-sm, 0.875rem);
  color: var(--n-color-neutral-500, #737373);
}

.n-donut-chart__list {
  list-style: none;
  margin: var(--n-spacing-5, 1.25rem) 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  /* 부모가 높이를 제한하면(고정 높이 카드) 목록만 내부 스크롤 */
  min-height: 0;
  overflow-y: auto;
}

.n-donut-chart__list-item {
  display: flex;
  align-items: center;
  gap: var(--n-spacing-2, 0.5rem);
  padding: 7px 0;
  font-size: var(--n-font-size-sm, 0.875rem);
}

.n-donut-chart__list-item + .n-donut-chart__list-item {
  border-top: var(--n-border-width-1, 1px) solid var(--n-color-neutral-100, #f5f5f5);
}

.n-donut-chart__chip {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  flex: none;
}

.n-donut-chart__name {
  color: var(--n-color-neutral-700, #404040);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.n-donut-chart__value {
  margin-left: auto;
  font-weight: var(--n-font-weight-semibold, 600);
  color: var(--n-color-neutral-800, #262626);
  font-variant-numeric: tabular-nums;
}

.n-donut-chart__pct {
  width: 3rem;
  text-align: right;
  font-size: var(--n-font-size-xs, 0.75rem);
  color: var(--n-color-neutral-500, #737373);
  font-variant-numeric: tabular-nums;
}

/* --- Loading: 헤더 유지 + 회색 도넛 링 + 리스트 스켈레톤 (컴포넌트 단위 로딩) --- */

.n-donut-chart__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 100%;
}

.n-donut-chart__placeholder-ring {
  display: block;
  max-width: 100%;
  border-radius: var(--n-radius-full, 9999px);
  border-style: solid;
  border-color: var(--n-color-neutral-100, #f5f5f5);
  animation: n-donut-skeleton-pulse 1.4s ease-in-out infinite;
}

.n-donut-chart__skeleton-chip {
  background: var(--n-color-neutral-200, #e5e5e5);
  animation: n-donut-skeleton-pulse 1.4s ease-in-out infinite;
}

.n-donut-chart__skeleton-bar {
  display: inline-block;
  height: 12px;
  border-radius: var(--n-radius-sm, 0.25rem);
  background: var(--n-color-neutral-200, #e5e5e5);
  animation: n-donut-skeleton-pulse 1.4s ease-in-out infinite;
}

/* 우측 값·비중 자리 — 리스트 행의 값 정렬과 동일하게 오른쪽 끝으로 */
.n-donut-chart__skeleton-bar--end {
  width: 4rem;
  margin-left: auto;
}

/* 시각적으로 감추되 접근성 트리에는 남긴다 (styles/base.css 의 .n-sr-only 와 동일 규칙) */
.n-donut-chart .n-chart-sr-only {
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

@keyframes n-donut-skeleton-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.45;
  }
}

@media (prefers-reduced-motion: reduce) {
  .n-donut-chart__placeholder-ring,
  .n-donut-chart__skeleton-chip,
  .n-donut-chart__skeleton-bar {
    animation: none;
  }
}
</style>
