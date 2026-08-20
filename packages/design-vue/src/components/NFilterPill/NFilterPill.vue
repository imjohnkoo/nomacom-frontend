<template>
  <button
    type="button"
    :class="pillClasses"
    :aria-pressed="active"
    :disabled="disabled"
    @click="onClick"
  >
    <span class="n-filter-pill__label"><slot /></span>
    <!--
      count 는 시각적으로 숫자만 떠 있어 «무엇의 수» 인지 끊긴다.
      숫자 자체는 aria-hidden 으로 감추고, 스크린리더에는 단위를 붙인 sr-only 텍스트를 준다.
      → 「진행중 1,234건, 선택됨」 처럼 읽힌다 (선택 여부는 aria-pressed 담당).
    -->
    <span
      v-if="count !== undefined"
      class="n-filter-pill__count"
      aria-hidden="true"
      >{{ formattedCount }}</span
    >
    <span
      v-if="count !== undefined"
      class="n-filter-pill__sr-only"
      >{{ formattedCount }}건</span
    >
  </button>
</template>

<script setup lang="ts">
/*
 * 루트는 반드시 실제 <button> 이다 — div + click 으로 흉내내면 키보드 활성화(Space/Enter)와
 * 폼 컨트롤 낭독이 통째로 사라진다. 선택 여부는 색이 아니라 aria-pressed 가 알린다.
 *
 * ⚠️ 템플릿 최상단에 주석을 두면 안 된다 — 주석도 루트 노드로 세어져 컴포넌트가 fragment 가
 *    되고, 그러면 class/aria-pressed 같은 fallthrough 속성이 <button> 에 붙지 않는다
 *    (테스트에서 루트가 DIV 로 잡히며 재현됐다). 그래서 이 설명이 여기 script 에 있다.
 */
import { computed } from 'vue'

export interface NFilterPillProps {
  active?: boolean
  count?: number
  size?: 'sm' | 'md'
  disabled?: boolean
}

const props = withDefaults(defineProps<NFilterPillProps>(), {
  active: false,
  count: undefined,
  size: 'sm',
  disabled: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const pillClasses = computed(() => [
  'n-filter-pill',
  `n-filter-pill--${props.size}`,
  {
    'n-filter-pill--active': props.active,
    'n-filter-pill--disabled': props.disabled,
  },
])

const formattedCount = computed(() => {
  if (props.count === undefined) return ''
  return props.count.toLocaleString()
})

function onClick(e: MouseEvent) {
  if (props.disabled) return
  emit('click', e)
}
</script>

<style scoped>
/* NFilterPill — 카운트 뱃지를 곁들인 클릭 가능한 필터 + 활성 상태 */

.n-filter-pill {
  display: inline-flex;
  align-items: center;
  gap: var(--n-spacing-1, 0.25rem);
  border: var(--n-border-width-1, 1px) solid var(--n-color-neutral-200, #e5e5e5);
  background-color: var(--n-filter-pill-bg, var(--n-color-neutral-100, #f5f5f5));
  color: var(--n-filter-pill-color, var(--n-color-neutral-700, #404040));
  border-radius: var(--n-filter-pill-border-radius, var(--n-radius-full, 9999px));
  font-family: inherit;
  font-size: var(--n-filter-pill-font-size, var(--n-font-size-sm, 0.875rem));
  font-weight: var(--n-filter-pill-font-weight, var(--n-font-weight-medium, 500));
  line-height: var(--n-font-line-height-none, 1);
  white-space: nowrap;
  cursor: pointer;
  transition:
    background-color var(--n-transition-fast, 150ms ease),
    color var(--n-transition-fast, 150ms ease),
    border-color var(--n-transition-fast, 150ms ease),
    box-shadow var(--n-transition-fast, 150ms ease);
}

.n-filter-pill:hover:not(:disabled) {
  background-color: var(--n-color-neutral-200, #e5e5e5);
  border-color: var(--n-color-neutral-300, #d4d4d4);
  color: var(--n-color-neutral-900, #171717);
}

.n-filter-pill:focus-visible {
  outline: var(--n-border-width-2, 2px) solid var(--n-color-primary-500, #6239ff);
  outline-offset: 2px;
}

/* ── 사이즈 ──
   md 는 토큰 패딩(--n-filter-pill-padding-*)을 그대로 쓴다. sm 은 목록 헤더처럼
   이미 다른 것에 종속된 자리용이라 한 단계 좁힌 리터럴을 쓴다 — 토큰을 sm 에 맞춰
   내리면 단독 배치된 md 필터바까지 같이 쪼그라든다. */
.n-filter-pill--sm {
  padding: 0.25rem 0.625rem;
  font-size: var(--n-font-size-xs, 0.75rem);
}

.n-filter-pill--md {
  padding: var(--n-filter-pill-padding-y, 0.375rem) var(--n-filter-pill-padding-x, 0.75rem);
}

/* 활성 상태 — 색(브랜드 틴트)만으로 알리지 않는다.
   inset ring 을 겹쳐 테두리를 «두껍게» 만들어 두께 차이라는 비색상 단서를 함께 준다.
   border-width 를 늘리지 않고 inset box-shadow 로 처리하는 이유는 레이아웃 흔들림 방지 —
   활성/비활성 전환 때 pill 폭이 2px 씩 튀면 필터바 전체가 재배치된다. */
.n-filter-pill--active {
  background-color: var(--n-filter-pill-active-bg, var(--n-color-primary-50, #f1edff));
  color: var(--n-filter-pill-active-color, var(--n-color-primary-700, #3f1cc0));
  border-color: var(--n-filter-pill-active-border-color, var(--n-color-primary-200, #c7b6ff));
  box-shadow: inset 0 0 0 var(--n-border-width-1, 1px) var(--n-filter-pill-active-border-color, var(--n-color-primary-200, #c7b6ff));
}

.n-filter-pill--active:hover:not(:disabled) {
  background-color: var(--n-color-primary-100, #e3dbff);
  border-color: var(--n-color-primary-300, #a78bff);
  color: var(--n-color-primary-800, #2f1499);
}

/* 카운트 뱃지 */
.n-filter-pill__count {
  font-size: 0.92em;
  font-weight: var(--n-font-weight-semibold, 600);
  color: var(--n-filter-pill-count-color, var(--n-color-neutral-500, #737373));
  font-variant-numeric: tabular-nums;
}

.n-filter-pill--active .n-filter-pill__count {
  color: var(--n-color-primary-600, #5025e8);
}

/* disabled */
.n-filter-pill--disabled,
.n-filter-pill:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.n-filter-pill__sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
