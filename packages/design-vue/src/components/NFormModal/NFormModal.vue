<template>
  <NModal
    :model-value="modelValue"
    :title="title"
    :description="description"
    :size="size"
    :closable="!submitting"
    @update:model-value="onOpenChange"
  >
    <!-- NModal 은 body 를 별도 슬롯으로 받는다 (default 슬롯은 DialogTrigger 라 쓰면 안 됨) -->
    <template #body>
      <!-- form 래핑 — 필드에서 Enter 로도 제출 -->
      <form :id="formId" class="n-form-modal" @submit.prevent="onSubmit">
        <slot />
        <p v-if="error" class="n-form-modal__error" role="alert">{{ error }}</p>
      </form>
    </template>

    <template #footer>
      <div class="n-form-modal__footer">
        <div v-if="$slots['footer-left']" class="n-form-modal__footer-left">
          <slot name="footer-left" />
        </div>
        <div class="n-form-modal__footer-actions">
          <NButton
            v-if="!hideCancel"
            type="button"
            variant="outline"
            size="sm"
            :disabled="submitting"
            @click="close"
          >
            {{ cancelLabel }}
          </NButton>
          <!--
            footer 는 body 밖(NModal 의 별도 슬롯)이므로 DOM 상 form 바깥에 있다.
            `form` 속성으로 폼과 연결해야 이 버튼이 진짜 submit 버튼이 되고,
            그래야 입력 필드에서 Enter 로도 제출이 동작한다.
            (m8 은 click 핸들러만 달아 둬서 필드가 2개 이상인 폼에서는
             HTML 암묵적 제출이 일어나지 않아 Enter 제출이 안 됐다.)
          -->
          <NButton
            type="submit"
            :form="formId"
            :variant="submitVariant"
            size="sm"
            :loading="submitting"
            :disabled="submitDisabled"
          >
            {{ submitLabel }}
          </NButton>
        </div>
      </div>
    </template>
  </NModal>
</template>

<script setup lang="ts">
// 폼 모달 표준 골격 — admin 폼 모달이 반복 복제하던 패턴을 흡수:
// footer 취소/주요액션, 제출 중 닫기 차단(백드롭/ESC/헤더 X/취소), 에러 라인, Enter 제출.
// fetch/토스트/리셋은 앱 소유 — submitting/error 를 prop 으로 넘기고 @submit 에서 처리한다.
//
// 닫기 차단은 NModal 의 `closable` 로 위임한다 (Esc·백드롭은 reka-ui 이벤트에서 preventDefault,
// 헤더 X 는 렌더 자체가 빠진다). update:modelValue 게이팅은 취소 버튼 등 나머지 경로용 2차 방어.
import { useId } from 'vue'
import { NButton } from '../NButton'
import { NModal } from '../NModal'

export interface NFormModalProps {
  /** 열림 상태 (v-model) — nomacom NModal/NConfirmDialog 와 동일하게 modelValue 사용 */
  modelValue: boolean
  title?: string
  description?: string
  size?: 'sm' | 'md' | 'lg'
  /** 제출 진행 중 — 버튼 로딩 + 모달 닫기 차단 */
  submitting?: boolean
  /** 표준 에러 라인 (본문 아래) — 마크업 커스텀은 본문 슬롯에서 직접 */
  error?: string
  submitLabel?: string
  cancelLabel?: string
  submitVariant?: 'primary' | 'danger'
  submitDisabled?: boolean
  hideCancel?: boolean
}

const props = withDefaults(defineProps<NFormModalProps>(), {
  title: undefined,
  description: undefined,
  size: 'md',
  submitting: false,
  error: undefined,
  submitLabel: '저장',
  cancelLabel: '취소',
  submitVariant: 'primary',
  submitDisabled: false,
  hideCancel: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: []
  cancel: []
}>()

/* footer submit 버튼 ↔ body 안 form 을 잇는 id */
const formId = `n-form-modal-${useId()}`

function onOpenChange(next: boolean) {
  // NModal 의 closable=false 가 Esc·백드롭·X 를 이미 막지만,
  // 다른 경로로 닫힘이 올라와도 제출 중이면 무시한다 (2차 방어).
  if (!next && props.submitting) return
  emit('update:modelValue', next)
}

function close() {
  if (props.submitting) return
  emit('cancel')
  emit('update:modelValue', false)
}

function onSubmit() {
  if (props.submitting || props.submitDisabled) return
  emit('submit')
}
</script>

<style scoped>
/* NFormModal — 폼 모달 표준 골격 */

.n-form-modal {
  display: flex;
  flex-direction: column;
  gap: var(--n-spacing-3, 0.75rem);
  font-family: var(--n-font-family-sans, 'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Segoe UI', 'Noto Sans KR', sans-serif);
}

.n-form-modal__error {
  margin: 0;
  padding: var(--n-spacing-2, 0.5rem) var(--n-spacing-3, 0.75rem);
  border: var(--n-border-width-1, 1px) solid var(--n-color-error-200, #fecaca);
  background: var(--n-color-error-50, #fef2f2);
  border-radius: var(--n-radius-lg, 0.5rem);
  font-size: var(--n-font-size-sm, 0.875rem);
  line-height: var(--n-font-line-height-normal, 1.5);
  color: var(--n-color-error-700, #b91c1c);
}

.n-form-modal__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--n-spacing-2, 0.5rem);
  width: 100%;
}

.n-form-modal__footer-left {
  margin-right: auto;
  display: flex;
  align-items: center;
  gap: var(--n-spacing-2, 0.5rem);
}

.n-form-modal__footer-actions {
  display: flex;
  align-items: center;
  gap: var(--n-spacing-2, 0.5rem);
}
</style>
