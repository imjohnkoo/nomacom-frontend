<template>
  <div class="n-chart-tooltip">
    <div v-if="title" class="n-chart-tooltip__title">{{ title }}</div>
    <div v-for="row in rows" :key="row.key" class="n-chart-tooltip__row">
      <span class="n-chart-tooltip__chip" :style="{ backgroundColor: row.color }" />
      <span class="n-chart-tooltip__name">{{ row.name }}</span>
      <span class="n-chart-tooltip__value">{{ row.value }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
// 4개 차트 공용 툴팁 내부 마크업 — 차트별 인라인 스타일 대신 공용 클래스 사용.
import type { NChartTooltipRow } from './utils'

defineProps<{
  title?: string
  rows: NChartTooltipRow[]
}>()
</script>

<!-- ⛔ scoped 금지. DonutChart 는 이 슬롯의 innerHTML 을 «문자열로 복사해» 툴팁 노드에
     넣는다(DonutChart 내부 `slotWrapper.innerHTML`). 복사된 노드에는 Vue 의 scope 속성
     data-v-* 이 붙지 않으므로 scoped 로 쓰면 도넛 툴팁만 스타일이 통째로 빠진다.
     nomacom DS 는 SFC scoped 가 기본이지만 여기는 그 예외다 — 되돌리지 말 것. -->
<style>
/* NChartTooltip — 모든 차트 툴팁의 통일된 내부 디자인.
   타이틀-데이터 사이 divider 없음 (표준 확정). */
.n-chart-tooltip {
  display: flex;
  flex-direction: column;
  gap: var(--n-spacing-1, 0.25rem);
  min-width: 8.25rem;
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

.n-chart-tooltip__title {
  font-size: var(--n-font-size-xs, 0.75rem);
  font-weight: var(--n-font-weight-bold, 700);
  color: var(--n-color-neutral-800, #262626);
  border: none;
  text-transform: none;
}

.n-chart-tooltip__row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--n-font-size-xs, 0.75rem);
  line-height: 1.4;
}

.n-chart-tooltip__chip {
  width: 9px;
  height: 9px;
  border-radius: 2px;
  flex: none;
}

.n-chart-tooltip__name {
  color: var(--n-color-neutral-500, #737373);
}

.n-chart-tooltip__value {
  margin-left: auto;
  padding-left: var(--n-spacing-3, 0.75rem);
  font-weight: var(--n-font-weight-bold, 700);
  color: var(--n-color-neutral-800, #262626);
  font-variant-numeric: tabular-nums;
}
</style>
