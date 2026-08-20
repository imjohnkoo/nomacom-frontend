<template>
  <div :class="rootClasses">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface NKpiStripProps {
  /**
   * Show vertical dividers between items.
   * Default true — matches handoff spec (border-left on each item except the first).
   */
  divided?: boolean
  /**
   * Show a top border above the strip. Use when the strip sits inside a card below KPI meta row.
   */
  borderTop?: boolean
  gap?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<NKpiStripProps>(), {
  divided: true,
  borderTop: false,
  gap: 'md',
})

const rootClasses = computed(() => [
  'n-kpi-strip',
  `n-kpi-strip--gap-${props.gap}`,
  {
    'n-kpi-strip--divided': props.divided,
    'n-kpi-strip--border-top': props.borderTop,
  },
])
</script>

<style scoped>
/* NKpiStrip — horizontal layout for NKpi children (flex: 1 each).
 * 자식은 전부 슬롯 콘텐츠라 scoped CSS 가 직접 닿지 않는다 → :slotted() 로 지정.
 * (m8 원본은 전역 .css 였기에 `> *` 로 충분했지만 nomacom 은 SFC scoped 규약) */

.n-kpi-strip {
  /* 항목 사이 간격. gap 변형에서 이 로컬 변수만 갈아끼운다 */
  --n-kpi-strip-space: var(--n-kpi-strip-gap, 1rem);
  display: flex;
  align-items: stretch;
  gap: var(--n-kpi-strip-space);
  min-width: 0;
}

.n-kpi-strip > :slotted(*) {
  flex: 1 1 0;
  min-width: 0;
}

/* Gap variants */
.n-kpi-strip--gap-sm {
  --n-kpi-strip-space: var(--n-spacing-3, 0.75rem);
}
.n-kpi-strip--gap-lg {
  --n-kpi-strip-space: var(--n-spacing-6, 1.5rem);
}

/* Dividers — 구분선이 두 항목 정중앙에 오도록 gap 만큼의 padding 을 왼쪽에 더 준다.
 * `:slotted(* + *)` 는 컴파일 시 `*` 가 유실돼 깨진 셀렉터가 되므로 :not(:first-child) 사용 */
.n-kpi-strip--divided > :slotted(*:not(:first-child)) {
  border-left: var(--n-border-width-1, 1px) solid
    var(--n-kpi-strip-divider-color, var(--n-color-neutral-200, #e5e5e5));
  padding-left: var(--n-kpi-strip-space);
}

/* Top-border variant (e.g. inside header card below meta row) */
.n-kpi-strip--border-top {
  border-top: var(--n-border-width-1, 1px) solid
    var(--n-kpi-strip-divider-color, var(--n-color-neutral-200, #e5e5e5));
  padding-top: var(--n-spacing-3, 0.75rem);
}
</style>
