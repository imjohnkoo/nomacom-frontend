<template>
  <div :class="rootClasses">
    <div class="n-kpi__label">{{ label }}</div>
    <div class="n-kpi__value-row">
      <!-- loading: 라벨은 유지, 값 자리만 스켈레톤 (NStat 과 동일한 컴포넌트 단위 로딩) -->
      <span v-if="loading" class="n-kpi__value-skeleton" role="status" aria-busy="true">
        <span class="n-kpi__sr-only">{{ loadingLabel }}</span>
      </span>
      <template v-else>
        <span class="n-kpi__value">{{ value }}</span>
        <span v-if="suffix" class="n-kpi__suffix">{{ suffix }}</span>
        <span v-if="delta" class="n-kpi__delta" :class="`n-kpi__delta--${resolvedDeltaDirection}`">
          <!-- 색상만으로 증감을 전달하지 않는다 — 기호(시각) + sr-only(낭독기) 병행 -->
          <span v-if="deltaSymbol" class="n-kpi__delta-symbol" aria-hidden="true">
            {{ deltaSymbol }}
          </span>
          {{ delta }}
          <span v-if="deltaSrLabel" class="n-kpi__sr-only">{{ deltaSrLabel }}</span>
        </span>
        <span v-if="sub" class="n-kpi__sub">{{ sub }}</span>
      </template>
    </div>
    <div v-if="hint || $slots.hint" class="n-kpi__hint">
      <slot name="hint">{{ hint }}</slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export type NKpiAccent = 'default' | 'success' | 'warning' | 'danger' | 'primary'

/** 델타 방향 — 색상/기호/낭독 문구를 함께 결정한다 */
export type NKpiDeltaDirection = 'up' | 'down' | 'flat'

export interface NKpiProps {
  label: string
  value: string | number
  suffix?: string
  /**
   * Secondary highlight rendered next to the value.
   * Typical usage: "+28" (weekly delta) — pass the pre-formatted string with sign.
   */
  delta?: string
  /**
   * 델타 방향. 생략하면 delta 문자열의 앞 부호(+ / - / ▲ / ▼)로 자동 판별한다.
   * 부호 없는 문구("2배" 등)를 쓰면서 방향을 알리고 싶을 때만 명시.
   */
  deltaDirection?: NKpiDeltaDirection
  /**
   * Small sub text rendered after the value (e.g. "/ 11" or "원").
   */
  sub?: string
  hint?: string
  accent?: NKpiAccent
  /** true 면 라벨/힌트는 유지하고 값 자리만 스켈레톤으로 렌더 (컴포넌트 단위 로딩) */
  loading?: boolean
  /** 스켈레톤이 낭독기에 읽히는 문구 */
  loadingLabel?: string
}

const props = withDefaults(defineProps<NKpiProps>(), {
  suffix: undefined,
  delta: undefined,
  deltaDirection: undefined,
  sub: undefined,
  hint: undefined,
  accent: 'default',
  loading: false,
  loadingLabel: '불러오는 중',
})

const rootClasses = computed(() => ['n-kpi', `n-kpi--${props.accent}`])

const resolvedDeltaDirection = computed<NKpiDeltaDirection>(() => {
  if (props.deltaDirection) return props.deltaDirection
  const raw = (props.delta ?? '').trim()
  if (/^[+▲↑]/.test(raw)) return 'up'
  // 하이픈(-) 뿐 아니라 유니코드 마이너스(−)·엔 대시(–) 도 감산으로 본다.
  if (/^[-−–▼↓]/.test(raw)) return 'down'
  return 'flat'
})

const deltaSymbol = computed(() => {
  if (resolvedDeltaDirection.value === 'up') return '▲'
  if (resolvedDeltaDirection.value === 'down') return '▼'
  return ''
})

const deltaSrLabel = computed(() => {
  if (resolvedDeltaDirection.value === 'up') return '증가'
  if (resolvedDeltaDirection.value === 'down') return '감소'
  return ''
})
</script>

<style scoped>
/* NKpi — single KPI tile.
 * Handoff spec: uppercase overline label, bold value, optional delta/sub.
 * 타일 자체는 서피스(배경/보더)를 갖지 않는다 — 여백·구분선은 NKpiStrip 이 담당. */

.n-kpi {
  display: flex;
  flex-direction: column;
  gap: var(--n-kpi-gap, 0.375rem);
  min-width: 0;
  font-family: var(--n-font-family-sans, 'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Segoe UI', 'Noto Sans KR', sans-serif);
}

.n-kpi__label {
  font-size: var(--n-kpi-label-font-size, var(--n-font-size-xs, 0.75rem));
  font-weight: var(--n-font-weight-semibold, 600);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--n-kpi-label-color, var(--n-color-neutral-500, #737373));
  line-height: 1.2;
}

.n-kpi__value-row {
  display: flex;
  align-items: baseline;
  gap: var(--n-spacing-2, 0.5rem);
  line-height: 1.1;
  min-width: 0;
}

.n-kpi__value {
  font-size: var(--n-kpi-value-font-size, var(--n-font-size-3xl, 1.875rem));
  font-weight: var(--n-kpi-value-font-weight, var(--n-font-weight-bold, 700));
  color: var(--n-color-neutral-900, #171717);
  /* 값이 갱신돼도 자릿수 흔들림이 없도록 고정폭 숫자 */
  font-variant-numeric: tabular-nums;
}

.n-kpi__suffix {
  font-size: var(--n-kpi-sub-font-size, var(--n-font-size-xs, 0.75rem));
  font-weight: var(--n-font-weight-medium, 500);
  color: var(--n-color-neutral-400, #a3a3a3);
}

.n-kpi__delta {
  display: inline-flex;
  align-items: baseline;
  gap: 2px;
  font-size: var(--n-kpi-sub-font-size, var(--n-font-size-xs, 0.75rem));
  font-weight: var(--n-font-weight-semibold, 600);
  color: var(--n-color-neutral-500, #737373);
}

.n-kpi__delta-symbol {
  font-size: 0.75em;
  line-height: 1;
}

.n-kpi__delta--up {
  color: var(--n-kpi-delta-up-color, var(--n-color-success-600, #16a34a));
}

.n-kpi__delta--down {
  color: var(--n-kpi-delta-down-color, var(--n-color-error-600, #dc2626));
}

.n-kpi__sub {
  font-size: var(--n-kpi-sub-font-size, var(--n-font-size-xs, 0.75rem));
  font-weight: var(--n-font-weight-medium, 500);
  color: var(--n-color-neutral-400, #a3a3a3);
}

.n-kpi__hint {
  font-size: var(--n-kpi-sub-font-size, var(--n-font-size-xs, 0.75rem));
  color: var(--n-kpi-sub-color, var(--n-color-neutral-500, #737373));
}

/* Accents — tint the value color */
.n-kpi--success .n-kpi__value {
  color: var(--n-color-success-700, #15803d);
}
.n-kpi--warning .n-kpi__value {
  color: var(--n-color-warning-700, #b45309);
}
/* warning/danger 타일에서는 델타도 경고색 — 방향색보다 타일 강조가 우선한다.
 * (증감 자체는 기호/sr-only 로 계속 전달되므로 색 의존이 아니다) */
.n-kpi--warning .n-kpi__delta,
.n-kpi--danger .n-kpi__delta {
  color: var(--n-color-warning-600, #d97706);
}
.n-kpi--danger .n-kpi__value {
  color: var(--n-color-error-700, #b91c1c);
}
.n-kpi--primary .n-kpi__value {
  color: var(--n-color-primary-700, #3f1cc0);
}

/* loading: 값 자리만 스켈레톤 — 라벨/힌트는 유지 (NStat / NSkeleton 과 동일 규칙) */
.n-kpi__value-skeleton {
  display: inline-block;
  width: 4rem;
  max-width: 70%;
  height: calc(var(--n-kpi-value-font-size, var(--n-font-size-3xl, 1.875rem)) * 0.85);
  border-radius: var(--n-skeleton-border-radius, var(--n-radius-md, 0.375rem));
  background: var(--n-skeleton-bg, var(--n-color-neutral-200, #e5e5e5));
  animation: n-kpi-skeleton-pulse var(--n-skeleton-animation-duration, 1.5s) ease-in-out infinite;
}

@keyframes n-kpi-skeleton-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.45;
  }
}

@media (prefers-reduced-motion: reduce) {
  .n-kpi__value-skeleton {
    animation: none;
  }
}

/* 시각적으로 감추되 접근성 트리에는 남긴다 (styles/base.css 의 .n-sr-only 와 동일 규칙,
 * scoped 안에서 쓰려고 로컬로 둔다 — NPagination 과 같은 패턴) */
.n-kpi__sr-only {
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
</style>
