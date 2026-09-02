<template>
  <!-- ================= Display mode ================= -->
  <span v-if="!editing" :class="displayClasses">
    <!--
      ⭐ 표시 상태의 트리거는 **실제 `<button>`** 이어야 한다.
         `div + @click` 로 만들면 Tab 으로 도달할 수 없고 Enter/Space 도 먹지 않아
         키보드·스크린리더 사용자에게는 «편집 가능» 이라는 사실 자체가 존재하지 않는다.
      readonly 일 때만 `<span>` 으로 낮춘다 — 눌리지 않는 버튼을 탭 순서에 남겨두면
      «눌렀는데 아무 일도 안 일어나는» 함정이 된다.
    -->
    <component
      :is="readonly ? 'span' : 'button'"
      ref="triggerRef"
      :type="readonly ? undefined : 'button'"
      :class="[
        'n-editable-field__trigger',
        { 'n-editable-field__trigger--readonly': readonly },
      ]"
      :title="readonly ? readonlyLabel : editTooltip"
      @click="startEdit"
    >
      <!--
        `flex: 0 1 auto` — 디스플레이 영역이 자연 너비로 wrap content 하고,
        연필 아이콘이 텍스트 바로 옆에 붙도록. 과거 `flex: 1` 은 아이콘을 row
        오른쪽 끝으로 밀어서 텍스트와 아이콘 사이 여백이 과했음.
      -->
      <span class="n-editable-field__display">
        <slot name="display" :value="modelValue" :is-empty="isEmpty">
          <span v-if="isEmpty" class="n-editable-field__empty">{{ emptyText }}</span>
          <span
            v-else
            class="n-editable-field__value"
            :class="{ 'n-editable-field__value--mono': mono }"
          >
            {{ computedDisplayText }}
          </span>
        </slot>
      </span>

      <!-- readonly: 자물쇠. 그 외: 연필. -->
      <span v-if="readonly" class="n-editable-field__lock">
        <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path
            d="M10 2a4 4 0 0 0-4 4v2H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h-1V6a4 4 0 0 0-4-4Zm-2 6V6a2 2 0 1 1 4 0v2H8Z"
          />
        </svg>
      </span>
      <span v-else class="n-editable-field__pencil">
        <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path
            d="M13.586 3.586a2 2 0 0 1 2.828 2.828l-.793.793-2.828-2.828.793-.793Zm-1.854 1.854L3 14.172V17h2.828l8.732-8.732-2.828-2.828Z"
          />
        </svg>
      </span>

      <!--
        `title` 은 마우스 전용이다. readonlyReason / 편집 안내를 **접근 가능한 이름**으로도
        내보내려면 실제 텍스트 노드가 필요하다 (aria-label 을 쓰면 값 텍스트를 덮어써서
        «무엇을» 편집하는지가 사라진다). 그래서 시각적으로만 감춘 텍스트를 붙인다.
      -->
      <span class="n-editable-field__sr-only">{{ readonly ? readonlyLabel : editTooltip }}</span>
    </component>
  </span>

  <!-- ================= Edit mode ================= -->
  <span v-else :class="editClasses">
    <!--
      ⛔ 저장/취소 버튼에 `margin-top` 이나 고정 높이를 다시 넣지 마라.
         m8 시절엔 버튼이 28px 고정이라 md 입력(38px) 옆에서 10px 낮았고,
         `--m8-input-height` 를 참조하는 식으로 땜질했었다. nomacom 의 NInput 은
         height 토큰이 아니라 padding 으로 크기가 정해지므로 숫자를 따라 적을 수가 없다.
         → `__row` 에 `align-items: stretch` 를 걸어 **버튼이 입력 높이를 그대로 상속**하게 한다.
         에러 문구는 row 밖(`__error`)에 두었으므로, 에러가 떠도 버튼이
         «입력+에러» 의 중앙으로 내려가는 과거 회귀는 구조적으로 재발하지 않는다.
    -->
    <span class="n-editable-field__row">
      <span
        ref="controlRef"
        class="n-editable-field__control"
        @keydown="handleKey"
      >
        <NTextarea
          v-if="type === 'textarea'"
          :model-value="draftString"
          :placeholder="placeholder"
          :disabled="saving"
          :rows="3"
          size="sm"
          :error="!!error"
          :aria-invalid="error ? 'true' : undefined"
          :aria-describedby="error ? errorId : undefined"
          @update:model-value="(v: string) => (draft = v)"
        />
        <!--
          select 는 두 갈래다.
          - 기본(searchable=false): `NSelect` — m8 의 `M8InputMenu :filterable="false"` 대응.
            nomacom `NInputMenu` 는 searchable=false 로 두면 입력창이 아예 렌더되지 않아
            **선택된 값이 화면에 보이지 않는다**. NSelect 는 SelectValue 로 선택 라벨을
            표시하고 옵션별 `disabled` 도 지원하므로 이쪽이 m8 의 의도에 맞는다.
          - searchable=true: `NInputMenu` — m8 의 `filterable=true` 대응(검색형 콤보박스).
        -->
        <NSelect
          v-else-if="type === 'select' && !searchable"
          :model-value="draftString"
          :items="selectItems"
          :placeholder="placeholder"
          :disabled="saving"
          @update:model-value="(v: string) => (draft = v)"
        />
        <NInputMenu
          v-else-if="type === 'select'"
          :model-value="draftString"
          :items="menuItems"
          :placeholder="placeholder"
          :disabled="saving"
          searchable
          @update:model-value="(v: string) => (draft = v)"
        />
        <NCheckbox
          v-else-if="type === 'boolean'"
          :model-value="Boolean(draft)"
          :label="checkboxLabel"
          :disabled="saving"
          @update:model-value="(v: boolean) => (draft = v)"
        />
        <NInput
          v-else
          :model-value="draftString"
          :type="htmlInputType"
          :inputmode="htmlInputMode"
          :placeholder="placeholder"
          :disabled="saving"
          size="sm"
          :error="!!error"
          :aria-invalid="error ? 'true' : undefined"
          :aria-describedby="error ? errorId : undefined"
          @update:model-value="(v: string) => (draft = v)"
        />
      </span>

      <span class="n-editable-field__actions">
        <button
          type="button"
          class="n-editable-field__save"
          :disabled="saving"
          :title="saveTooltip"
          :aria-label="saveTooltip"
          @click="save"
        >
          <span v-if="saving" class="n-editable-field__spinner" aria-hidden="true" />
          <svg
            v-else
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            stroke-width="2.6"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <polyline points="16 5 8 14 4 10" />
          </svg>
        </button>
        <button
          type="button"
          class="n-editable-field__cancel"
          :disabled="saving"
          :title="cancelTooltip"
          :aria-label="cancelTooltip"
          @click="cancel"
        >
          <svg
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            stroke-width="2.4"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <line x1="15" y1="5" x2="5" y2="15" />
            <line x1="5" y1="5" x2="15" y2="15" />
          </svg>
        </button>
      </span>
    </span>

    <!-- 저장 실패/검증 실패는 즉시 읽혀야 하므로 role="alert" (aria-live=assertive) -->
    <span v-if="error" :id="errorId" class="n-editable-field__error" role="alert">
      {{ error }}
    </span>
  </span>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { NInput } from '../NInput'
import { NInputMenu } from '../NInputMenu'
import { NSelect } from '../NSelect'
import { NTextarea } from '../NTextarea'
import { NCheckbox } from '../NCheckbox'
import { useId } from '../../composables'

export type NEditableFieldValue = string | number | boolean | null | undefined
export type NEditableFieldType =
  | 'text'
  | 'url'
  | 'tel'
  | 'number'
  | 'textarea'
  | 'select'
  | 'boolean'

export interface NEditableFieldOption {
  label: string
  value: string
  /**
   * 개별 옵션 비활성화. `searchable: false`(기본, `NSelect`) 에서만 동작한다 —
   * `NInputMenu` 는 옵션별 disabled 를 전달하지 않는다.
   */
  disabled?: boolean
}

export interface NEditableFieldProps {
  modelValue: NEditableFieldValue
  type?: NEditableFieldType
  options?: NEditableFieldOption[]
  placeholder?: string
  /**
   * `type === 'select'` 일 때 검색 가능한 콤보박스(`NInputMenu`)를 쓸지 여부.
   * 기본 `false` → `NSelect`(단순 드롭다운). m8 의 `filterable` 에 대응한다.
   */
  searchable?: boolean
  /**
   * Label for the inline `NCheckbox` when `type === 'boolean'`.
   * Defaults to '사용'.
   */
  checkboxLabel?: string
  /**
   * Text shown in display mode when `modelValue` is empty.
   * Defaults to the same value as `placeholder` ('미설정').
   */
  emptyText?: string
  /**
   * Readonly mode — shows a 🔒 icon instead of the edit pencil + disables editing.
   */
  readonly?: boolean
  readonlyReason?: string
  /**
   * Use a monospace font for the display value.
   */
  mono?: boolean
  /**
   * Full-width layout (display: flex) instead of inline.
   */
  block?: boolean
  /**
   * Tooltip for the edit (pencil) trigger. Defaults to '편집'.
   */
  editTooltip?: string
  /**
   * Pre-formatted display text (overrides the raw value). Useful for e.g. formatted dates.
   */
  displayText?: string | null
  /**
   * Optional validator. Return a string to display as error; null/undefined = valid.
   */
  validate?: (v: NEditableFieldValue) => string | null | undefined
  /**
   * Optional auto-formatter (trim, normalize URL, etc.) applied before validate + save.
   *
   * 왜 필요한가: 운영자가 붙여넣는 값에는 앞뒤 공백·전각 문자·`http://` 누락이 섞여 들어온다.
   * 이걸 `validate` 안에서 처리하면 «검증은 통과했는데 저장된 값은 원문» 이 되어버리므로,
   * **정규화(autoFormat) → 검증(validate) → 저장(saveFn)** 순서를 강제한다.
   */
  autoFormat?: (v: NEditableFieldValue) => NEditableFieldValue
  /**
   * If provided, called on save. Loading state + error surface is managed internally.
   * Throw with a message to populate `error`.
   *
   * 에러 처리 규약: `saveFn` 이 throw 하면 **편집 모드를 닫지 않는다.** 입력값을 그대로 둔 채
   * 에러만 표시해서 사용자가 고쳐서 재시도할 수 있게 한다 (닫아버리면 방금 친 내용이 날아간다).
   */
  saveFn?: (v: NEditableFieldValue) => Promise<void>
}

const props = withDefaults(defineProps<NEditableFieldProps>(), {
  type: 'text',
  options: undefined,
  placeholder: '미설정',
  searchable: false,
  checkboxLabel: '사용',
  emptyText: undefined,
  editTooltip: '편집',
  readonly: false,
  readonlyReason: undefined,
  mono: false,
  block: false,
  displayText: undefined,
  validate: undefined,
  autoFormat: undefined,
  saveFn: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: NEditableFieldValue]
  save: [value: NEditableFieldValue]
  error: [err: unknown]
  'start-edit': []
  cancel: []
}>()

const editing = ref(false)
const draft = ref<NEditableFieldValue>(props.modelValue)
const saving = ref(false)
const error = ref<string | null>(null)

const errorId = useId('n-editable-field-error')

const triggerRef = ref<HTMLElement | null>(null)
const controlRef = ref<HTMLElement | null>(null)

watch(
  () => props.modelValue,
  (v) => {
    if (!editing.value) draft.value = v
  },
)

const isEmpty = computed(() => {
  const v = props.modelValue
  if (v == null) return true
  if (typeof v === 'string' && v.trim() === '') return true
  return false
})

const computedDisplayText = computed(() => {
  if (props.displayText != null) return props.displayText
  if (props.type === 'boolean') return props.modelValue ? '사용' : '사용 안 함'
  return props.modelValue == null ? '' : String(props.modelValue)
})

const htmlInputType = computed<'text' | 'url' | 'tel'>(() => {
  switch (props.type) {
    case 'url':
      return 'url'
    case 'tel':
      return 'tel'
    default:
      // number 도 `type="text"` 로 둔다 — `<input type="number">` 는 유효하지 않은 입력에서
      // `value` 를 조용히 빈 문자열로 만들어 «친 내용이 사라지는» 무증상 버그를 만든다.
      // 숫자 파싱은 save() 에서 직접 한다. 모바일 키패드는 아래 inputmode 로 해결.
      return 'text'
  }
})

/** number 타입에서만 숫자 키패드를 띄운다 (NInput 의 `$attrs` 전달로 실제 `<input>` 에 도달). */
const htmlInputMode = computed<'decimal' | undefined>(() =>
  props.type === 'number' ? 'decimal' : undefined,
)

const draftString = computed(() => (draft.value == null ? '' : String(draft.value)))

const emptyText = computed(() => props.emptyText ?? props.placeholder)

const readonlyLabel = computed(() => props.readonlyReason ?? '수정 불가')

const saveTooltip = computed(() =>
  props.type === 'textarea' ? '저장 (Ctrl/⌘+Enter)' : '저장 (Enter)',
)
const cancelTooltip = '취소 (Esc)'

/** `NSelect` 용 아이템 (옵션별 disabled 지원). */
const selectItems = computed(() =>
  (props.options ?? []).map((o) => ({ label: o.label, value: o.value, disabled: o.disabled })),
)
/** `NInputMenu` 용 아이템 — label/value 만 받는다. */
const menuItems = computed(() =>
  (props.options ?? []).map((o) => ({ label: o.label, value: o.value })),
)

const displayClasses = computed(() => [
  'n-editable-field',
  'n-editable-field--display',
  { 'n-editable-field--block': props.block, 'n-editable-field--readonly': props.readonly },
])

const editClasses = computed(() => [
  'n-editable-field',
  'n-editable-field--edit',
  { 'n-editable-field--block': props.block },
])

/**
 * 편집 진입 시 입력으로 **포커스를 옮긴다.** 옮기지 않으면 트리거 버튼이 사라지면서
 * 포커스가 `body` 로 날아가고, 키보드 사용자는 문서 맨 위로 되돌아간 셈이 된다.
 * 타입마다 실제 포커스 대상이 다르므로(input / textarea / reka 의 role=checkbox 버튼 /
 * select trigger 버튼) 컨테이너에서 첫 포커스 가능 요소를 찾는다.
 */
function focusEditor() {
  const el = controlRef.value?.querySelector<HTMLElement>(
    'input, textarea, [role="checkbox"], button',
  )
  el?.focus?.()
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) el.select?.()
}

/**
 * 편집 종료 시 트리거로 **포커스를 되돌린다.**
 * 단, 사용자가 이미 컴포넌트 바깥으로 이동했거나(`cancel()` 을 부모가 프로그래밍적으로 호출)
 * 하는 경우엔 포커스를 훔치면 안 되므로, 편집 영역 안에 포커스가 있었을 때만 되돌린다.
 * (Safari 는 버튼 클릭 시 포커스를 주지 않아 activeElement 가 body 가 되므로 이것도 허용.)
 */
function restoreTriggerFocus(hadFocusInside: boolean) {
  if (!hadFocusInside) return
  nextTick(() => triggerRef.value?.focus?.())
}

function isFocusInsideEditor(): boolean {
  if (typeof document === 'undefined') return false
  const active = document.activeElement
  if (!active || active === document.body) return true
  return controlRef.value?.closest('.n-editable-field')?.contains(active) ?? false
}

function startEdit() {
  if (props.readonly || saving.value) return
  draft.value = props.modelValue
  error.value = null
  editing.value = true
  emit('start-edit')
  nextTick(focusEditor)
}

function cancel() {
  const hadFocus = isFocusInsideEditor()
  editing.value = false
  error.value = null
  draft.value = props.modelValue
  emit('cancel')
  restoreTriggerFocus(hadFocus)
}

async function save() {
  // 중복 제출 방지 — 버튼 disabled 와 별개로 Enter 연타/프로그래밍 호출도 막는다.
  if (saving.value) return

  let next: NEditableFieldValue = draft.value
  if (props.autoFormat) next = props.autoFormat(next)

  if (props.type === 'number' && typeof next === 'string') {
    if (next.trim() === '') next = null
    else {
      const parsed = Number(next)
      if (!Number.isNaN(parsed)) next = parsed
    }
  }

  if (props.validate) {
    const err = props.validate(next)
    if (err) {
      error.value = err
      return
    }
  }

  // no-change shortcut
  const prev = props.modelValue
  const same = JSON.stringify(next ?? null) === JSON.stringify(prev ?? null)
  if (same) {
    const hadFocus = isFocusInsideEditor()
    editing.value = false
    error.value = null
    restoreTriggerFocus(hadFocus)
    return
  }

  const hadFocus = isFocusInsideEditor()
  saving.value = true
  error.value = null
  try {
    if (props.saveFn) {
      await props.saveFn(next)
    }
    // ⚠️ **낙관적 업데이트를 하지 않는다.** `update:modelValue` 는 `saveFn` 이 resolve 된
    //    뒤에만 emit 한다. 먼저 emit 해두면 서버가 거절했을 때 화면에는 새 값이,
    //    DB 에는 옛 값이 남아 «저장된 것처럼 보이는» 상태가 된다 (되돌리는 코드도 필요해진다).
    emit('update:modelValue', next)
    emit('save', next)
    editing.value = false
    restoreTriggerFocus(hadFocus)
  } catch (e) {
    // 실패 시 편집 모드를 유지한다 — 입력값을 보존해 그대로 고쳐 재시도할 수 있게.
    const msg = (e as Error)?.message || '저장에 실패했습니다.'
    error.value = msg
    emit('error', e)
  } finally {
    saving.value = false
  }
}

function handleKey(e: KeyboardEvent) {
  // reka 의 select/combobox 팝업은 Escape 를 스스로 소비하며 preventDefault 한다.
  // 그 이벤트까지 받아 편집을 취소하면 «팝업만 닫으려 했는데 편집이 통째로 날아가는» 꼴이 된다.
  if (e.defaultPrevented) return

  if (e.key === 'Escape') {
    e.preventDefault()
    cancel()
    return
  }
  if (e.key === 'Enter') {
    // For textarea: only save on Ctrl/Cmd+Enter (allow newlines otherwise).
    if (props.type === 'textarea' && !(e.metaKey || e.ctrlKey)) return
    // select 는 Enter 가 «옵션 확정» 이라 저장까지 겹치면 한 번의 Enter 로 두 동작이 일어난다.
    if (props.type === 'select') return
    e.preventDefault()
    save()
  }
}

defineExpose({ startEdit, cancel, save })
</script>

<style scoped>
/* NEditableField — 연필 트리거 인라인 편집 + readonly(🔒) 모드. */

.n-editable-field {
  display: inline-flex;
  align-items: center;
  gap: var(--n-editable-field-gap, 0.5rem);
  min-width: 0;
  max-width: 100%;
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
  font-size: var(--n-editable-field-font-size, var(--n-font-size-sm, 0.875rem));
  line-height: var(--n-font-line-height-normal, 1.5);
}

.n-editable-field--block {
  display: flex;
  width: 100%;
}

/* ---- Display mode ---- */
/* ⭐ **연필은 상시 노출한다.** 예전엔 `opacity: 0` + hover/focus 에서만 1 이었는데, 그러면
      «이 필드가 편집 가능하다» 는 사실을 **마우스를 올려보기 전에는 알 수 없다**. 운영자는
      편집 가능한 필드를 찾으려고 카드 위를 훑어야 했고, 터치·키보드 사용자에게는 단서가
      아예 없었다 (2026-08-17 개편).
   ⛔ 다시 `opacity: 0` 으로 숨기지 마라. 밀도가 걱정되면 **색을 낮춰라** — 아래처럼 평상시엔
      neutral-400 으로 물러나 있고 hover 에서 진해지므로, 항상 보이면서도 값을 압도하지 않는다. */
.n-editable-field__trigger {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: var(--n-spacing-1, 0.25rem);
  min-width: 0;
  max-width: 100%;
  margin: 0;
  padding: var(--n-editable-field-display-padding, 0.25rem 0.375rem);
  border: var(--n-border-width-1, 1px) solid transparent;
  border-radius: var(--n-editable-field-display-border-radius, var(--n-radius-md, 0.375rem));
  background: transparent;
  font: inherit;
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    background-color var(--n-transition-fast, 150ms ease),
    border-color var(--n-transition-fast, 150ms ease),
    color var(--n-transition-fast, 150ms ease);
}

.n-editable-field--block .n-editable-field__trigger {
  width: 100%;
}

.n-editable-field__trigger:hover {
  background-color: var(--n-editable-field-display-hover-bg, var(--n-color-neutral-50, #fafafa));
  border-color: var(--n-color-neutral-200, #e5e5e5);
}

/* ⚠️ 여기 있던 `opacity: 1` 은 제거했다 — 상시 노출로 바뀌어 되살릴 opacity 가 없다.
   (남겨두면 「어딘가에서 아이콘을 숨기고 있다」는 잘못된 신호가 된다.) */
.n-editable-field__trigger:focus-visible {
  outline: none;
  background-color: var(--n-editable-field-display-hover-bg, var(--n-color-neutral-50, #fafafa));
  box-shadow: 0 0 0 2px var(--n-color-primary-200, #c7b6ff);
}

/* readonly 는 버튼이 아니라 `<span>` 이므로 커서만 정리해 준다. */
.n-editable-field__trigger--readonly {
  cursor: default;
}

.n-editable-field__trigger--readonly:hover {
  background-color: transparent;
  border-color: transparent;
}

/* `flex: 0 1 auto` — 디스플레이 영역이 자연 너비로 wrap content 하고, 아이콘이 텍스트
   바로 옆에 붙도록. 과거 `flex: 1` 은 아이콘을 오른쪽 끝으로 밀어 여백이 과했음. */
.n-editable-field__display {
  display: inline-flex;
  align-items: center;
  gap: var(--n-spacing-1, 0.25rem);
  min-width: 0;
  flex: 0 1 auto;
}

.n-editable-field__value {
  color: var(--n-color-neutral-900, #171717);
  font-weight: var(--n-font-weight-medium, 500);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.n-editable-field__value--mono {
  font-family: var(--n-font-family-mono, 'JetBrains Mono', 'Fira Code', Consolas, monospace);
}

.n-editable-field__empty {
  color: var(--n-color-neutral-400, #a3a3a3);
  font-size: var(--n-font-size-xs, 0.75rem);
  font-style: italic;
}

/* ---- Edit pencil (display mode) ---- */
.n-editable-field__pencil {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--n-color-neutral-400, #a3a3a3);
  transition: color var(--n-transition-fast, 150ms ease);
}

/* 필드에 마우스를 올리면 아이콘이 먼저 진해진다 — 클릭 대상임을 확인시켜 준다. */
.n-editable-field__trigger:hover .n-editable-field__pencil,
.n-editable-field__trigger:focus-visible .n-editable-field__pencil {
  color: var(--n-color-neutral-700, #404040);
}

.n-editable-field__pencil svg {
  display: block;
  width: 13px;
  height: 13px;
}

/* ---- Readonly lock icon ---- */
.n-editable-field__lock {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  color: var(--n-editable-field-readonly-color, var(--n-color-neutral-400, #a3a3a3));
  cursor: help;
}

.n-editable-field__lock svg {
  display: block;
  width: 11px;
  height: 11px;
}

/* ---- Edit mode ---- */
.n-editable-field--edit {
  display: inline-flex;
  flex-direction: column;
  align-items: stretch;
  gap: 2px;
  width: 100%;
  max-width: 26.25rem;
}

.n-editable-field--edit.n-editable-field--block {
  display: flex;
  width: 100%;
  max-width: 100%;
}

/* ⭐ 저장/취소 버튼은 **입력과 같은 높이**여야 한다. 숫자를 박아 넣지 말고
   `align-items: stretch` 로 입력 높이를 그대로 상속하게 둔다 — 소비 앱이 입력 크기를
   바꿔도(예: 툴바에서 더 낮게) 버튼이 저절로 따라간다. */
.n-editable-field__row {
  display: flex;
  align-items: stretch;
  gap: var(--n-editable-field-gap, 0.5rem);
  min-width: 0;
}

.n-editable-field__control {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
}

.n-editable-field__control > * {
  flex: 1;
  min-width: 0;
}

.n-editable-field__error {
  font-size: var(--n-font-size-xs, 0.75rem);
  line-height: var(--n-font-line-height-normal, 1.5);
  color: var(--n-editable-field-error-color, var(--n-color-error-600, #dc2626));
}

/* ---- Save / Cancel action buttons ---- */
.n-editable-field__actions {
  display: inline-flex;
  gap: var(--n-editable-field-action-gap, 0.25rem);
  flex-shrink: 0;
}

.n-editable-field__save,
.n-editable-field__cancel {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  min-width: var(--n-input-height, 2.375rem);
  aspect-ratio: 1;
  padding: 0;
  border: var(--n-border-width-1, 1px) solid transparent;
  border-radius: var(--n-radius-md, 0.375rem);
  cursor: pointer;
  transition:
    background-color var(--n-transition-fast, 150ms ease),
    color var(--n-transition-fast, 150ms ease);
}

.n-editable-field__save:focus-visible,
.n-editable-field__cancel:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--n-color-primary-200, #c7b6ff);
}

.n-editable-field__save {
  background-color: var(--n-color-primary-500, #6239ff);
  color: var(--n-color-white, #ffffff);
}

.n-editable-field__save:hover:not(:disabled) {
  background-color: var(--n-color-primary-600, #5025e8);
}

/* 저장 중에는 두 버튼 모두 disabled — 중복 제출/편집 중 취소 경합을 막는다. */
.n-editable-field__save:disabled {
  background-color: var(--n-color-neutral-400, #a3a3a3);
  cursor: wait;
}

/* 38px 급 버튼에 맞춘 아이콘 크기(구 14px — 28px 버튼 기준이었다). */
.n-editable-field__save svg {
  display: block;
  width: 16px;
  height: 16px;
}

.n-editable-field__cancel {
  background-color: var(--n-color-neutral-100, #f5f5f5);
  color: var(--n-color-neutral-600, #525252);
}

.n-editable-field__cancel:hover:not(:disabled) {
  background-color: var(--n-color-neutral-200, #e5e5e5);
  color: var(--n-color-neutral-900, #171717);
}

.n-editable-field__cancel:disabled {
  opacity: 0.5;
  cursor: wait;
}

.n-editable-field__cancel svg {
  display: block;
  width: 16px;
  height: 16px;
}

/* Spinner */
.n-editable-field__spinner {
  width: 14px;
  height: 14px;
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  border-top-color: var(--n-color-white, #ffffff);
  border-radius: var(--n-radius-full, 9999px);
  animation: n-editable-field-spin 0.6s linear infinite;
}

@keyframes n-editable-field-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .n-editable-field__spinner {
    animation-duration: 2s;
  }

  .n-editable-field__trigger,
  .n-editable-field__pencil,
  .n-editable-field__save,
  .n-editable-field__cancel {
    transition: none;
  }
}

/* 시각적으로만 감춘 접근 가능 텍스트 (readonlyReason / 편집 안내). */
.n-editable-field__sr-only {
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
