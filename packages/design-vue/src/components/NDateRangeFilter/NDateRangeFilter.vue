<template>
  <div class="n-date-range-filter">
    <!-- 프리셋 — 실제 <button>. 선택 상태는 aria-pressed 로 노출하고,
         시각적으로도 색 외에 굵기/테두리로 구분한다 (색만으로 상태 전달 금지) -->
    <div class="n-date-range-filter__presets" role="group" :aria-label="presetLabel">
      <button
        v-for="p in presets"
        :key="p.key"
        type="button"
        class="n-date-range-filter__preset"
        :class="{ 'n-date-range-filter__preset--active': preset === p.key }"
        :aria-pressed="preset === p.key"
        @click="selectPreset(p.key)"
      >
        {{ p.label }}
      </button>

      <!-- 직접입력 — 패널(시작/종료일 + 적용) 토글 트리거 -->
      <button
        ref="triggerEl"
        type="button"
        class="n-date-range-filter__preset n-date-range-filter__preset--custom"
        :class="{ 'n-date-range-filter__preset--active': preset === CUSTOM_KEY }"
        :aria-pressed="preset === CUSTOM_KEY"
        :aria-expanded="panelOpen"
        aria-haspopup="dialog"
        @click="togglePanel"
      >
        <span>{{ customLabel }}</span>
        <span v-if="appliedText" class="n-date-range-filter__value">{{ appliedText }}</span>
        <svg
          class="n-date-range-filter__caret"
          width="10"
          height="10"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M3 4.5l3 3 3-3"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>

    <div
      v-if="panelOpen"
      ref="panelEl"
      class="n-date-range-filter__panel"
      role="dialog"
      :aria-label="rangeLabel"
    >
      <form @submit.prevent="onApply">
        <div class="n-date-range-filter__fields">
          <div class="n-date-range-filter__field" role="group" :aria-label="startLabel">
            <span class="n-date-range-filter__label">{{ startLabel }}</span>
            <NInputDate
              :model-value="draft.startDate"
              @update:model-value="draft.startDate = $event"
            />
          </div>
          <div class="n-date-range-filter__field" role="group" :aria-label="endLabel">
            <span class="n-date-range-filter__label">{{ endLabel }}</span>
            <NInputDate :model-value="draft.endDate" @update:model-value="draft.endDate = $event" />
          </div>
        </div>

        <!-- 검증 실패는 aria-live 로 즉시 읽히게 (적용 버튼이 disable 되지 않으므로
             실패 사유가 스크린리더에도 반드시 전달되어야 한다) -->
        <p
          v-if="validationMessage"
          class="n-date-range-filter__error"
          role="alert"
          aria-live="assertive"
        >
          {{ validationMessage }}
        </p>

        <div class="n-date-range-filter__panel-actions">
          <NButton type="button" variant="ghost" size="sm" @click="closePanel()">
            {{ closeLabel }}
          </NButton>
          <NButton type="submit" variant="primary" size="sm">
            {{ applyLabel }}
          </NButton>
        </div>
      </form>
    </div>

    <slot name="append" />
  </div>
</template>

<script setup lang="ts">
// 기간 필터 표준 컴포넌트 — 프리셋 + 시작/종료일 + 적용 버튼 + 검증.
// admin messages 3개 페이지가 ~130줄씩 복제하던 preset↔custom 동기화 로직을 흡수한다.
// 규칙: 프리셋 선택 = 즉시 적용 · 날짜 수동 편집 = custom 전환 후 적용 버튼으로 커밋.
//
// nomacom 이관 노트 (m8 대비 UI 변경):
// - m8 은 M8SelectMenu(드롭다운) + M8InputDate(range 모드) 조합이었다.
//   nomacom NSelectMenu 는 인라인 Listbox(드롭다운 아님)이고 NInputDate 에는 range
//   모드가 없어 그대로 옮길 수 없다. 그래서 프리셋은 pill <button> 들로, 수동 입력은
//   NInputDate 2개(시작/종료)를 담은 패널로 구성했다.
//   (design-tokens 의 `date-range-filter` 네임스페이스도 preset-gap / panel-* 로
//    이 형태를 전제하고 있다.)
// - 상태 로직(프리셋 해석 · custom 전환 · draft/apply · 검증)은 m8 과 동일하다.
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { NButton } from '../NButton'
import { NInputDate } from '../NInputDate'

export interface NDateRangeFilterValue {
  startDate: string
  endDate: string
}

export interface NDateRangeFilterPreset {
  key: string
  label: string
  /** 오늘 포함 일수 (1=오늘, 7=최근 7일). range 지정 시 무시 */
  days?: number
  /** 커스텀 계산이 필요할 때 (예: 이번 달) — days 대신 사용 */
  range?: () => NDateRangeFilterValue
}

export interface NDateRangeFilterProps {
  /** 적용된 기간 (v-model) */
  modelValue: NDateRangeFilterValue
  /** 적용된 프리셋 키 (v-model:preset) — 수동 기간은 'custom' */
  preset?: string
  presets?: NDateRangeFilterPreset[]
  /**
   * 조회 가능 최대 일수 (0 = 제한 없음).
   * 기본 90 — 백엔드 로그/메시지 집계가 분기 단위로만 인덱싱돼 있어 그보다 긴
   * 범위를 그대로 던지면 풀스캔이 된다. UI 에서 먼저 막아 타임아웃을 방지한다.
   */
  maxRangeDays?: number
  /** 앱 고유 추가 검증 — 에러 메시지를 반환하면 적용 차단 */
  validate?: (range: NDateRangeFilterValue) => string | null
  presetLabel?: string
  rangeLabel?: string
  applyLabel?: string
  customLabel?: string
  startLabel?: string
  endLabel?: string
  closeLabel?: string
}

const props = withDefaults(defineProps<NDateRangeFilterProps>(), {
  preset: 'custom',
  // 프리셋은 `days`(오늘 포함 일수) 또는 `range()`(직접 계산) 둘 중 하나로 정의한다.
  // 대부분의 기간 필터가 오늘 기준 N일이라 days 를 기본형으로 두고, 이번 달/지난 달처럼
  // 경계 계산이 필요한 경우에만 range() 를 쓰도록 한 구조다.
  presets: () => [
    { key: 'today', label: '오늘', days: 1 },
    { key: '7d', label: '최근 7일', days: 7 },
    { key: '30d', label: '최근 30일', days: 30 },
  ],
  maxRangeDays: 90,
  validate: undefined,
  presetLabel: '기간 프리셋',
  rangeLabel: '기간',
  applyLabel: '적용',
  customLabel: '직접입력',
  startLabel: '시작일',
  endLabel: '종료일',
  closeLabel: '닫기',
})

const emit = defineEmits<{
  'update:modelValue': [value: NDateRangeFilterValue]
  'update:preset': [key: string]
  apply: [value: NDateRangeFilterValue, preset: string]
}>()

const CUSTOM_KEY = 'custom'

function toDateString(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function resolvePreset(key: string): NDateRangeFilterValue | null {
  const p = props.presets.find((x) => x.key === key)
  if (!p) return null
  if (p.range) return p.range()
  const days = p.days ?? 1
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - (days - 1))
  return { startDate: toDateString(start), endDate: toDateString(end) }
}

/* 편집 중 값(draft) — 적용 전까지 modelValue 를 건드리지 않는다 */
const draft = reactive<NDateRangeFilterValue>({
  startDate: props.modelValue.startDate,
  endDate: props.modelValue.endDate,
})

const validationMessage = ref('')

/* 트리거에 적용된 기간을 같이 노출 — 패널을 열지 않아도 현재 범위를 알 수 있게 */
const appliedText = computed(() => {
  const { startDate, endDate } = props.modelValue
  if (!startDate && !endDate) return ''
  return `${startDate || '…'} ~ ${endDate || '…'}`
})

/* --- 패널 열기/닫기 --- */
const panelOpen = ref(false)
const panelEl = ref<HTMLElement | null>(null)
const triggerEl = ref<HTMLElement | null>(null)

function openPanel() {
  validationMessage.value = ''
  panelOpen.value = true
  document.addEventListener('mousedown', onDocMouseDown, true)
  document.addEventListener('keydown', onDocKeydown, true)
}

function closePanel(refocus = true) {
  if (!panelOpen.value) return
  panelOpen.value = false
  document.removeEventListener('mousedown', onDocMouseDown, true)
  document.removeEventListener('keydown', onDocKeydown, true)
  if (refocus) triggerEl.value?.focus()
}

function togglePanel() {
  if (panelOpen.value) {
    closePanel(false)
    return
  }
  // m8 과 동일 — '직접입력' 을 고르는 순간 preset 은 custom 으로 전환되고,
  // 실제 기간 커밋은 적용 버튼(또는 Enter)까지 기다린다.
  if (props.preset !== CUSTOM_KEY) emit('update:preset', CUSTOM_KEY)
  openPanel()
}

function onDocMouseDown(e: MouseEvent) {
  const target = e.target as Node | null
  if (!target) return
  if (panelEl.value?.contains(target)) return
  if (triggerEl.value?.contains(target)) return
  // NInputDate 달력은 Popper 로 패널 밖에 그려질 수 있어 예외 처리
  if (target instanceof Element && target.closest('.n-input-date__content')) return
  closePanel(false)
}

function onDocKeydown(e: KeyboardEvent) {
  if (e.key !== 'Escape') return
  // 달력 팝업이 떠 있으면 그쪽 Esc 를 먼저 소비하게 두고 패널은 유지
  if (document.querySelector('.n-input-date__content')) return
  e.stopPropagation()
  closePanel()
}

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onDocMouseDown, true)
  document.removeEventListener('keydown', onDocKeydown, true)
})

/* --- 프리셋 선택: 즉시 적용 --- */
let syncing = false

function selectPreset(key: string) {
  validationMessage.value = ''
  const range = resolvePreset(key)
  if (!range) return
  syncing = true
  draft.startDate = range.startDate
  draft.endDate = range.endDate
  emit('update:preset', key)
  emit('update:modelValue', { ...range })
  emit('apply', { ...range }, key)
  closePanel(false)
  queueMicrotask(() => {
    syncing = false
  })
}

/* 날짜 수동 편집 → 현재 프리셋 범위와 달라지면 custom 으로 전환 */
watch(
  () => [draft.startDate, draft.endDate],
  () => {
    if (syncing) return
    if (props.preset !== CUSTOM_KEY) {
      const expected = resolvePreset(props.preset)
      if (
        expected &&
        (draft.startDate !== expected.startDate || draft.endDate !== expected.endDate)
      ) {
        emit('update:preset', CUSTOM_KEY)
      }
    }
  },
)

/* 외부(URL 등)에서 modelValue 가 바뀌면 draft 동기화 */
watch(
  () => props.modelValue,
  (v) => {
    syncing = true
    draft.startDate = v.startDate
    draft.endDate = v.endDate
    queueMicrotask(() => {
      syncing = false
    })
  },
  { deep: true },
)

function onApply() {
  validationMessage.value = ''
  if (!draft.startDate || !draft.endDate) {
    validationMessage.value = '시작일과 종료일을 모두 입력해 주세요.'
    return
  }
  const start = new Date(`${draft.startDate}T00:00:00`).getTime()
  const end = new Date(`${draft.endDate}T00:00:00`).getTime()
  if (start > end) {
    validationMessage.value = '시작일은 종료일보다 이후일 수 없습니다.'
    return
  }
  if (props.maxRangeDays > 0) {
    const days = Math.floor((end - start) / 86400000) + 1
    if (days > props.maxRangeDays) {
      validationMessage.value = `조회 기간은 최대 ${props.maxRangeDays}일까지 가능합니다.`
      return
    }
  }
  const extra = props.validate?.({ ...draft })
  if (extra) {
    validationMessage.value = extra
    return
  }
  emit('update:preset', CUSTOM_KEY)
  emit('update:modelValue', { ...draft })
  emit('apply', { ...draft }, CUSTOM_KEY)
  closePanel()
}
</script>

<style scoped>
/* NDateRangeFilter — 기간 프리셋 + 시작/종료일 + 적용 */

.n-date-range-filter {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--n-date-range-filter-gap, 0.5rem);
  flex-wrap: wrap;
  font-family: var(--n-font-family-sans, 'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Segoe UI', 'Noto Sans KR', sans-serif);
  font-size: var(--n-date-range-filter-font-size, var(--n-font-size-sm, 0.875rem));
}

.n-date-range-filter__presets {
  display: flex;
  align-items: center;
  gap: var(--n-date-range-filter-preset-gap, 0.25rem);
  flex-wrap: wrap;
}

.n-date-range-filter__preset {
  display: inline-flex;
  align-items: center;
  gap: var(--n-spacing-2, 0.5rem);
  /* 필드 컨트롤(38px 표준)과 같은 높이/기준선으로 정렬 */
  height: var(--n-date-range-filter-height, 2.375rem);
  padding: var(--n-filter-pill-padding-y, 0.375rem) var(--n-filter-pill-padding-x, 0.75rem);
  border: var(--n-border-width-1, 1px) solid transparent;
  border-radius: var(--n-filter-pill-border-radius, var(--n-radius-full, 9999px));
  background-color: var(--n-filter-pill-bg, var(--n-color-neutral-100, #f5f5f5));
  color: var(--n-filter-pill-color, var(--n-color-neutral-700, #404040));
  font-family: inherit;
  font-size: var(--n-filter-pill-font-size, var(--n-font-size-sm, 0.875rem));
  font-weight: var(--n-filter-pill-font-weight, var(--n-font-weight-medium, 500));
  line-height: var(--n-font-line-height-tight, 1.25);
  white-space: nowrap;
  cursor: pointer;
  transition: all var(--n-transition-fast, 150ms ease);
}

.n-date-range-filter__preset:hover {
  background-color: var(--n-color-neutral-200, #e5e5e5);
}

.n-date-range-filter__preset:focus-visible {
  outline: var(--n-border-width-2, 2px) solid var(--n-color-primary-500, #6239ff);
  outline-offset: 2px;
}

/* 활성 프리셋 — 색 외에 테두리 + 굵기로도 구분 */
.n-date-range-filter__preset--active {
  background-color: var(--n-filter-pill-active-bg, var(--n-color-primary-50, #f1edff));
  color: var(--n-filter-pill-active-color, var(--n-color-primary-700, #3f1cc0));
  border-color: var(--n-filter-pill-active-border-color, var(--n-color-primary-200, #c7b6ff));
  font-weight: var(--n-font-weight-semibold, 600);
}

.n-date-range-filter__preset--active:hover {
  background-color: var(--n-color-primary-100, #e3dbff);
}

.n-date-range-filter__value {
  color: var(--n-color-neutral-500, #737373);
  font-weight: var(--n-font-weight-normal, 400);
  font-variant-numeric: tabular-nums;
}

.n-date-range-filter__preset--active .n-date-range-filter__value {
  color: var(--n-color-primary-600, #5025e8);
}

.n-date-range-filter__caret {
  flex-shrink: 0;
}

.n-date-range-filter__preset[aria-expanded='true'] .n-date-range-filter__caret {
  transform: rotate(180deg);
}

/* --- 패널 --- */
.n-date-range-filter__panel {
  position: absolute;
  top: calc(100% + var(--n-spacing-2, 0.5rem));
  left: 0;
  z-index: var(--n-z-index-dropdown, 1000);
  min-width: 17.5rem;
  padding: var(--n-date-range-filter-panel-padding, 1rem);
  border-radius: var(--n-date-range-filter-panel-border-radius, var(--n-radius-xl, 0.75rem));
  background-color: var(--n-date-range-filter-panel-bg, var(--n-color-white, #ffffff));
  box-shadow: var(
    --n-date-range-filter-panel-shadow,
    var(--n-shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1)),
    var(--n-shadow-ring, 0 0 0 1px rgba(0, 0, 0, 0.05))
  );
}

.n-date-range-filter__fields {
  display: flex;
  flex-direction: column;
  gap: var(--n-spacing-3, 0.75rem);
}

.n-date-range-filter__field {
  display: flex;
  flex-direction: column;
  gap: var(--n-form-field-gap, 0.375rem);
  /* 날짜 세그먼트(M/D/Y)가 줄바꿈되지 않을 최소 폭 */
  min-width: 11.25rem;
}

.n-date-range-filter__label {
  font-size: var(--n-form-field-label-font-size, var(--n-font-size-sm, 0.875rem));
  font-weight: var(--n-form-field-label-font-weight, var(--n-font-weight-medium, 500));
  color: var(--n-form-field-label-color, var(--n-color-neutral-700, #404040));
  line-height: var(--n-font-line-height-tight, 1.25);
}

.n-date-range-filter__error {
  margin: var(--n-spacing-3, 0.75rem) 0 0;
  font-size: var(--n-font-size-xs, 0.75rem);
  line-height: var(--n-font-line-height-normal, 1.5);
  color: var(--n-date-range-filter-error-color, var(--n-color-error-600, #dc2626));
}

.n-date-range-filter__panel-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--n-spacing-2, 0.5rem);
  margin-top: var(--n-spacing-4, 1rem);
}
</style>
