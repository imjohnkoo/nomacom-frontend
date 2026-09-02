<template>
  <div
    class="n-segmented-control"
    :class="[
      { 'n-segmented-control--pill': pill },
      `n-segmented-control--${size ?? 'md'}`,
    ]"
    role="radiogroup"
  >
    <button
      v-for="(opt, i) in options"
      :key="String(opt.value)"
      :ref="(elm) => setItemRef(elm, i)"
      type="button"
      role="radio"
      :aria-checked="opt.value === modelValue"
      :tabindex="rovingIndex === i ? 0 : -1"
      class="n-segmented-control__item"
      :class="{ 'n-segmented-control__item--active': opt.value === modelValue }"
      :disabled="opt.disabled"
      @click="emit('update:modelValue', opt.value)"
      @keydown="onKeydown($event, i)"
    >
      {{ opt.label }}
      <!--
        뱃지는 라벨의 일부다 — aria-hidden 이면 스크린리더가 「대기」 만 읽고 건수를 빠뜨린다.
        시각 사용자가 보는 정보를 그대로 낭독시키되, 숫자만 떠서 의미가 끊기지 않도록
        aria-label 로 문맥을 붙인다.
      -->
      <span
        v-if="opt.badge !== undefined && opt.badge !== null"
        class="n-segmented-control__badge"
        :class="{ 'n-segmented-control__badge--warn': opt.badgeWarn }"
        :aria-label="`${opt.badge}${opt.badgeWarn ? ' (주의)' : ''}`"
      >
        {{ opt.badge }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts" generic="T extends string | number = string">
// 세그먼티드 컨트롤 — 소수의 상호배타 옵션 토글 (예: 전체/발급중/완료, 목록/그리드).
// 트랙 높이는 인풋 필드와 같은 --n-input-height 를 써서 폼·툴바에서 톤이 맞는다.
import { computed, nextTick, ref, type ComponentPublicInstance } from 'vue'

export interface NSegmentedOption<V extends string | number = string | number> {
  label: string
  value: V
  disabled?: boolean
  /** 라벨 옆 카운트 뱃지 (예: 탭 용도의 항목 수). null/undefined 면 미표시 */
  badge?: string | number | null
  /** 뱃지를 경고 톤(앰버)으로 — 예: 처리 지연 건수 */
  badgeWarn?: boolean
}

export interface NSegmentedControlProps<T extends string | number = string> {
  modelValue?: T
  options: NSegmentedOption<T>[]
  /** true 면 완전 라운드(pill) + 여유 패딩 — 탭 용도 (기본: 인풋 톤 라운드 사각) */
  pill?: boolean
  /**
   * 높이 단계. 기본 `md` = `--n-input-height`(2.375rem = 38px) — 헤더에서 NSelect 와 나란히 설 때.
   * `sm`(32px) 은 표 툴바처럼 **이미 다른 것에 종속된 자리**용.
   *
   * ⚠️ 예전엔 이 prop 이 없어서 `size="sm"` 이 raw DOM 속성으로 흘러 **아무 효과가 없었다**
   *    (여러 화면이 작게 쓰려다 전부 38px 로 렌더됐다).
   */
  size?: 'sm' | 'md'
}

const props = defineProps<NSegmentedControlProps<T>>()

const emit = defineEmits<{
  'update:modelValue': [value: T]
}>()

/*
 * 키보드 조작 — radiogroup 을 선언해놓고 화살표키·로빙 tabindex 가 없는 구현이 흔하다.
 * radiogroup 규약: 그룹 전체가 **탭 정지 1개**이고, 그룹 안 이동은 화살표키다.
 * 그래서 활성 항목만 tabindex=0, 나머지는 -1 이며 이동과 동시에 선택이 바뀐다.
 */
const items = ref<(HTMLButtonElement | null)[]>([])
function setItemRef(elm: Element | ComponentPublicInstance | null, i: number) {
  items.value[i] = elm as HTMLButtonElement | null
}

/** 탭으로 진입했을 때 포커스를 받을 항목 — 선택된 것, 없으면 첫 활성 항목 */
const rovingIndex = computed(() => {
  const sel = props.options.findIndex(
    (o) => o.value === props.modelValue && !o.disabled,
  )
  if (sel !== -1) return sel
  return props.options.findIndex((o) => !o.disabled)
})

/** disabled 를 건너뛰며 다음/이전 항목으로. 양끝에서 순환한다 */
function move(from: number, dir: 1 | -1) {
  const n = props.options.length
  for (let step = 1; step <= n; step++) {
    const i = (from + dir * step + n * step) % n
    if (!props.options[i]?.disabled) return i
  }
  return -1
}

function onKeydown(e: KeyboardEvent, i: number) {
  let target = -1
  switch (e.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      target = move(i, 1)
      break
    case 'ArrowLeft':
    case 'ArrowUp':
      target = move(i, -1)
      break
    case 'Home':
      target = move(-1, 1)
      break
    case 'End':
      target = move(props.options.length, -1)
      break
    default:
      return
  }
  if (target === -1) return
  e.preventDefault()
  emit('update:modelValue', props.options[target]!.value)
  nextTick(() => items.value[target]?.focus())
}
</script>

<style scoped>
/* NSegmentedControl — 중립 트랙 위에 활성 항목만 흰 서피스로 떠 있는 상호배타 토글 */

/* ⭐ «토글로 읽히게» — 트랙 여백과 radius 를 토큰 쌍으로 함께 관리한다.
   활성 박스가 트랙 가장자리에 붙으면 «선택 가능한 옵션» 이 아니라 그냥 색칠된 영역으로 읽힌다.

   ⚠️ 패딩만 키우면 중첩 radius 규칙(안쪽 = 바깥 − 패딩)상 아이템이 각져 보인다.
   그래서 컨테이너 radius(--n-segmented-control-border-radius) 와
   아이템 radius(--n-segmented-control-item-border-radius) 는 **둘 중 하나만
   오버라이드하면 안 된다** — 한쪽만 바꾸면 아이템이 각지거나 트랙 밖으로 삐져나온다. */
.n-segmented-control {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  gap: var(--n-segmented-control-gap, 0.125rem);
  padding: var(--n-segmented-control-padding, 0.25rem);
  height: var(--n-input-height, 2.375rem);
  box-sizing: border-box;
  background-color: var(--n-segmented-control-bg, var(--n-color-neutral-100, #f5f5f5));
  border-radius: var(--n-segmented-control-border-radius, var(--n-radius-lg, 0.5rem));
}

.n-segmented-control__item {
  /* `all: unset` 은 box-sizing / display 까지 되돌린다 — 아래에서 다시 선언하는 이유 */
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: var(--n-segmented-control-item-padding, 0.375rem 0.875rem);
  font-family: var(--n-font-family-sans, 'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Segoe UI', 'Noto Sans KR', sans-serif);
  font-size: var(--n-segmented-control-item-font-size, var(--n-font-size-sm, 0.875rem));
  font-weight: var(--n-segmented-control-item-font-weight, var(--n-font-weight-medium, 500));
  color: var(--n-segmented-control-inactive-color, var(--n-color-neutral-600, #525252));
  white-space: nowrap;
  cursor: pointer;
  transition:
    background-color var(--n-transition-fast, 150ms ease),
    color var(--n-transition-fast, 150ms ease),
    box-shadow var(--n-transition-fast, 150ms ease);
}

/* ⚠️ radius 는 **`:not(--pill)` 로 못 박아 별도 규칙**으로 둔다.
   `.n-segmented-control__item` 에 직접 쓰면
   `.n-segmented-control--pill .n-segmented-control__item`(둘 다 0,2,0)과 동률이라
   «파일에서 뒤에 오는 쪽» 이 이긴다. 지금은 pill 이 뒤라 우연히 맞지만, 규칙을 옮기거나
   앱이 오버라이드하는 순간 둥근형이 사각형으로 그려진다(실제로 목업에서 재현했다).
   아래 sm 주석과 같은 원칙 — 순서가 아니라 셀렉터로. */
.n-segmented-control:not(.n-segmented-control--pill) .n-segmented-control__item {
  border-radius: var(--n-segmented-control-item-border-radius, var(--n-radius-md, 0.375rem));
}

/* sm — 표 툴바처럼 이미 다른 것에 종속된 자리. 헤더의 스코프 컨트롤에는 쓰지 않는다
   (NSelect 38px 와 높이가 어긋난다). */
/* ⚠️ pill 과 함께 쓰면 sm 을 적용하지 않는다 — pill 은 «탭» 용도라 자체 높이 체계를
   갖는다. 선언 순서(pill 이 뒤)에 기대면 규칙을 옮기는 순간 화면이 조용히 바뀐다.
   순서가 아니라 셀렉터로 못 박는다. */
.n-segmented-control--sm:not(.n-segmented-control--pill) {
  height: 2rem;
  /* 패딩·radius 는 base 를 그대로 상속한다 — sm 만 여백을 더 좁히면
     활성 박스가 트랙 가장자리에 가장 심하게 붙는 자리가 된다. */
}

.n-segmented-control--sm:not(.n-segmented-control--pill) .n-segmented-control__item {
  padding: 0 0.6875rem;
  font-size: var(--n-font-size-xs, 0.75rem);
}

.n-segmented-control__item:hover:not(.n-segmented-control__item--active):not(:disabled) {
  background-color: var(--n-color-neutral-200, #e5e5e5);
  color: var(--n-color-neutral-800, #262626);
}

.n-segmented-control__item:focus-visible {
  outline: var(--n-border-width-2, 2px) solid var(--n-color-primary-500, #6239ff);
  outline-offset: -2px;
}

/* 활성 상태의 단서는 색 하나가 아니다 — 흰 서피스로의 «전환 + 그림자(고도)» 가 함께 바뀐다.
   색각 이상이나 강제 고대비 모드에서도 떠 있는 면은 남는다. 낭독은 aria-checked 가 담당. */
.n-segmented-control__item--active {
  background-color: var(--n-segmented-control-active-bg, var(--n-color-white, #ffffff));
  color: var(--n-segmented-control-active-color, var(--n-color-neutral-900, #171717));
  box-shadow: var(--n-segmented-control-active-shadow, var(--n-shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05)));
}

.n-segmented-control__item:disabled {
  color: var(--n-color-neutral-300, #d4d4d4);
  cursor: not-allowed;
}

/* ── pill 변형 — 탭 용도: 완전 라운드 + 여유 패딩 (컨테이너 높이는 콘텐츠 기반) ── */
.n-segmented-control--pill {
  height: auto;
  padding: 0.4375rem;
  gap: var(--n-spacing-1, 0.25rem);
  border-radius: var(--n-radius-full, 9999px);
}

.n-segmented-control--pill .n-segmented-control__item {
  border-radius: var(--n-radius-full, 9999px);
  padding: var(--n-spacing-2, 0.5rem) var(--n-spacing-4, 1rem);
}

/* 라벨 옆 카운트 뱃지 (탭 용도) */
.n-segmented-control__badge {
  margin-left: var(--n-spacing-1, 0.25rem);
  font-size: var(--n-font-size-xs, 0.75rem);
  font-weight: var(--n-font-weight-bold, 700);
  line-height: var(--n-font-line-height-none, 1);
  padding: 0.125rem 0.375rem;
  border-radius: var(--n-radius-full, 9999px);
  background-color: var(--n-color-neutral-200, #e5e5e5);
  color: var(--n-color-neutral-600, #525252);
}

.n-segmented-control__badge--warn {
  background-color: var(--n-color-warning-50, #fffbeb);
  color: var(--n-color-warning-700, #b45309);
}

.n-segmented-control__item--active .n-segmented-control__badge {
  background-color: var(--n-color-primary-50, #f1edff);
  color: var(--n-color-primary-700, #3f1cc0);
}

/* 경고 뱃지는 활성 항목 안에서도 앰버를 유지한다 — «주의» 는 선택 여부와 무관한 정보다.
   (낭독으로도 「(주의)」 가 붙으므로 색 하나에 기대지 않는다) */
.n-segmented-control__item--active .n-segmented-control__badge--warn {
  background-color: var(--n-color-warning-50, #fffbeb);
  color: var(--n-color-warning-700, #b45309);
}
</style>
