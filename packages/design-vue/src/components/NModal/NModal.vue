<template>
  <DialogRoot v-model:open="open">
    <DialogTrigger v-if="$slots.default" as-child>
      <slot />
    </DialogTrigger>
    <DialogPortal>
      <Transition name="n-modal-backdrop">
        <DialogOverlay v-if="open" class="n-modal__overlay" />
      </Transition>
      <Transition name="n-modal-content">
        <DialogContent
          v-if="open"
          :class="['n-modal__content', `n-modal__content--${size}`]"
          @escape-key-down="onEscapeKeyDown"
          @pointer-down-outside="onPointerDownOutside"
        >
          <div class="n-modal__header">
            <slot name="header">
              <DialogTitle v-if="title" class="n-modal__title">
                {{ title }}
              </DialogTitle>
              <DialogDescription v-if="description" class="n-modal__description">
                {{ description }}
              </DialogDescription>
            </slot>
            <DialogClose v-if="closable" class="n-modal__close" aria-label="닫기">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <line x1="4" y1="4" x2="12" y2="12" />
                <line x1="12" y1="4" x2="4" y2="12" />
              </svg>
            </DialogClose>
          </div>
          <div class="n-modal__body">
            <slot name="body" />
          </div>
          <div v-if="$slots.footer" class="n-modal__footer">
            <slot name="footer" />
          </div>
        </DialogContent>
      </Transition>
    </DialogPortal>
  </DialogRoot>
</template>

<script setup lang="ts">
import {
  DialogRoot,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from 'reka-ui'

export type NModalSize = 'sm' | 'md' | 'lg'

export interface NModalProps {
  /** Dialog title displayed in the header */
  title?: string
  /** Dialog description displayed below the title */
  description?: string
  /** 최대 폭. md = 기존 기본값(520px) */
  size?: NModalSize
  /**
   * false 면 닫기 X 버튼을 숨기고 Esc·백드롭 클릭도 막는다.
   * 제출 중처럼 «중간에 끊기면 안 되는» 작업에 쓴다.
   */
  closable?: boolean
  /** closable 과 별개로 Esc 만 개별 차단 */
  closeOnEscape?: boolean
  /** closable 과 별개로 백드롭 클릭만 개별 차단 */
  closeOnBackdrop?: boolean
}

const props = withDefaults(defineProps<NModalProps>(), {
  title: undefined,
  description: undefined,
  size: 'md',
  closable: true,
  closeOnEscape: true,
  closeOnBackdrop: true,
})

/**
 * ⚠️ `modelValue` 를 defineProps 에 선언하지 말 것.
 *
 * defineModel 이 이미 `modelValue` prop 과 `update:modelValue` emit 을 만든다.
 * 여기에 defineProps/defineEmits 로 같은 이름을 또 선언하면 Vue 가 둘을 병합하면서
 * emit 시그니처가 `(...args: unknown[]) => any` 로 넓어지고, 소비 측 핸들러가
 * `(v: boolean) => void` 이면 TS2322 로 깨진다.
 */
const open = defineModel<boolean>({ default: false })

function onEscapeKeyDown(event: KeyboardEvent) {
  if (!props.closable || !props.closeOnEscape) event.preventDefault()
}

function onPointerDownOutside(event: Event) {
  if (!props.closable || !props.closeOnBackdrop) event.preventDefault()
}
</script>

<style>
.n-modal__overlay {
  position: fixed;
  inset: 0;
  z-index: var(--n-z-index-modal-backdrop, 1040);
  background-color: rgb(0 0 0 / 0.5);
}

.n-modal__content {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: var(--n-z-index-modal, 1050);
  width: 90vw;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  border-radius: var(--n-radius-xl, 0.75rem);
  background-color: var(--n-color-neutral-0, #ffffff);
  box-shadow: var(--n-shadow-xl, 0 20px 25px -5px rgba(0, 0, 0, 0.1));
  font-family: var(--n-font-family-sans, 'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Segoe UI', 'Noto Sans KR', sans-serif);
  color: var(--n-color-neutral-800, #262626);
  overflow: hidden;
}

/* md 는 마이그레이션 이전 고정값(520px)을 그대로 토큰화한 것 — 기존 화면의 폭이 바뀌지 않는다. */
.n-modal__content--sm { max-width: var(--n-modal-max-width-sm, 25rem); }
.n-modal__content--md { max-width: var(--n-modal-max-width-md, 32.5rem); }
.n-modal__content--lg { max-width: var(--n-modal-max-width-lg, 50rem); }

.n-modal__content:focus {
  outline: none;
}

.n-modal__header {
  position: relative;
  padding: var(--n-spacing-5, 1.25rem) var(--n-spacing-6, 1.5rem);
  padding-right: var(--n-spacing-12, 3rem);
  border-bottom: var(--n-border-width-1, 1px) solid var(--n-color-neutral-200, #e5e5e5);
}

.n-modal__title {
  margin: 0;
  font-size: var(--n-font-size-lg, 1.125rem);
  font-weight: var(--n-font-weight-semibold, 600);
  color: var(--n-color-neutral-900, #171717);
  line-height: 1.4;
}

.n-modal__description {
  margin-top: var(--n-spacing-1, 0.25rem);
  font-size: var(--n-font-size-sm, 0.875rem);
  color: var(--n-color-neutral-500, #737373);
  line-height: 1.5;
}

.n-modal__close {
  position: absolute;
  top: var(--n-spacing-4, 1rem);
  right: var(--n-spacing-4, 1rem);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: var(--n-radius-sm, 0.25rem);
  background: transparent;
  color: var(--n-color-neutral-500, #737373);
  cursor: pointer;
  transition: background-color var(--n-transition-fast, 150ms ease);
}

.n-modal__close:hover {
  background-color: var(--n-color-neutral-100, #f5f5f5);
  color: var(--n-color-neutral-700, #404040);
}

.n-modal__close:focus-visible {
  outline: 2px solid var(--n-color-primary-500, #6239FF);
  outline-offset: 2px;
}

.n-modal__body {
  flex: 1;
  padding: var(--n-spacing-5, 1.25rem) var(--n-spacing-6, 1.5rem);
  overflow-y: auto;
  font-size: var(--n-font-size-sm, 0.875rem);
  line-height: 1.5;
}

.n-modal__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--n-spacing-3, 0.75rem);
  padding: var(--n-spacing-4, 1rem) var(--n-spacing-6, 1.5rem);
  border-top: var(--n-border-width-1, 1px) solid var(--n-color-neutral-200, #e5e5e5);
}

/* --- Transition: Backdrop --- */
.n-modal-backdrop-enter-active,
.n-modal-backdrop-leave-active {
  transition: opacity var(--n-transition-normal, 250ms ease) ease;
}
.n-modal-backdrop-enter-from,
.n-modal-backdrop-leave-to {
  opacity: 0;
}

/* --- Transition: Content --- */
.n-modal-content-enter-active,
.n-modal-content-leave-active {
  transition: opacity var(--n-transition-normal, 250ms ease) ease,
              transform var(--n-transition-normal, 250ms ease) ease;
}
.n-modal-content-enter-from {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.95);
}
.n-modal-content-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.95);
}
.n-modal-content-enter-to,
.n-modal-content-leave-from {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}
</style>
