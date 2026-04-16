<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <Transition name="n-confirm-backdrop">
        <DialogOverlay v-if="open" class="n-confirm__overlay" />
      </Transition>
      <Transition name="n-confirm-content">
        <DialogContent v-if="open" class="n-confirm__content">
          <div class="n-confirm__body">
            <div :class="['n-confirm__icon', `n-confirm__icon--${variant}`]">
              <svg v-if="variant === 'danger'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <DialogTitle class="n-confirm__title">{{ title }}</DialogTitle>
            <DialogDescription v-if="message" class="n-confirm__message">{{ message }}</DialogDescription>
            <slot />
          </div>
          <div class="n-confirm__actions">
            <button class="n-confirm__btn n-confirm__btn--cancel" @click="handleCancel">
              {{ cancelText }}
            </button>
            <button :class="['n-confirm__btn', `n-confirm__btn--${variant}`]" @click="handleConfirm">
              {{ confirmText }}
            </button>
          </div>
        </DialogContent>
      </Transition>
    </DialogPortal>
  </DialogRoot>
</template>

<script setup lang="ts">
import {
  DialogRoot,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from 'reka-ui'

export interface NConfirmDialogProps {
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'danger'
  modelValue?: boolean
}

withDefaults(defineProps<NConfirmDialogProps>(), {
  title: '확인',
  message: undefined,
  confirmText: '확인',
  cancelText: '취소',
  variant: 'default',
  modelValue: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
  cancel: []
}>()

const open = defineModel<boolean>({ default: false })

function handleConfirm() {
  emit('confirm')
  open.value = false
}

function handleCancel() {
  emit('cancel')
  open.value = false
}
</script>

<style>
.n-confirm__overlay {
  position: fixed;
  inset: 0;
  z-index: var(--zIndex-modal-backdrop, 1040);
  background-color: rgb(0 0 0 / 0.5);
}

.n-confirm__content {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: var(--zIndex-modal, 1050);
  width: 90vw;
  max-width: 400px;
  border-radius: var(--radius-xl, 0.75rem);
  background-color: var(--color-neutral-0, #ffffff);
  box-shadow: var(--shadow-xl, 0 20px 25px -5px rgb(0 0 0 / 0.1));
  font-family: var(--font-fontFamily-sans, sans-serif);
  overflow: hidden;
}

.n-confirm__content:focus { outline: none; }

.n-confirm__body {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--spacing-8, 2rem) var(--spacing-6, 1.5rem) var(--spacing-5, 1.25rem);
}

.n-confirm__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full, 9999px);
  margin-bottom: var(--spacing-4, 1rem);
}

.n-confirm__icon--default {
  background-color: var(--color-primary-50, #f5f3ff);
  color: var(--color-primary-500, #6239FF);
}

.n-confirm__icon--danger {
  background-color: var(--color-error-50, #fef2f2);
  color: var(--color-error-500, #ef4444);
}

.n-confirm__title {
  margin: 0;
  font-size: var(--font-fontSize-lg, 1.125rem);
  font-weight: var(--font-fontWeight-semibold, 600);
  color: var(--color-neutral-900, #171717);
  line-height: 1.4;
}

.n-confirm__message {
  margin-top: var(--spacing-2, 0.5rem);
  font-size: var(--font-fontSize-sm, 0.875rem);
  color: var(--color-neutral-500, #737373);
  line-height: 1.5;
}

.n-confirm__actions {
  display: flex;
  gap: var(--spacing-3, 0.75rem);
  padding: var(--spacing-4, 1rem) var(--spacing-6, 1.5rem) var(--spacing-6, 1.5rem);
  justify-content: center;
}

.n-confirm__btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2, 0.5rem) var(--spacing-4, 1rem);
  border-radius: var(--radius-md, 0.375rem);
  font-family: var(--font-fontFamily-sans, sans-serif);
  font-size: var(--font-fontSize-sm, 0.875rem);
  font-weight: var(--font-fontWeight-medium, 500);
  cursor: pointer;
  transition: all var(--transition-fast, 150ms ease);
  border: var(--borderWidth-1, 1px) solid transparent;
  outline: none;
}

.n-confirm__btn:focus-visible {
  box-shadow: 0 0 0 2px var(--color-primary-200, #ddd6fe);
}

.n-confirm__btn--cancel {
  background-color: var(--color-neutral-100, #f5f5f5);
  color: var(--color-neutral-700, #404040);
  border-color: var(--color-neutral-200, #e5e5e5);
}
.n-confirm__btn--cancel:hover {
  background-color: var(--color-neutral-200, #e5e5e5);
}

.n-confirm__btn--default {
  background-color: var(--color-primary-600, #5530e6);
  color: var(--color-neutral-0, #ffffff);
}
.n-confirm__btn--default:hover {
  background-color: var(--color-primary-700, #4826cc);
}

.n-confirm__btn--danger {
  background-color: var(--color-error-500, #ef4444);
  color: var(--color-neutral-0, #ffffff);
}
.n-confirm__btn--danger:hover {
  background-color: var(--color-error-700, #b91c1c);
}

/* Transitions */
.n-confirm-backdrop-enter-active,
.n-confirm-backdrop-leave-active { transition: opacity 200ms ease; }
.n-confirm-backdrop-enter-from,
.n-confirm-backdrop-leave-to { opacity: 0; }

.n-confirm-content-enter-active,
.n-confirm-content-leave-active { transition: opacity 200ms ease, transform 200ms ease; }
.n-confirm-content-enter-from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
.n-confirm-content-leave-to { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
.n-confirm-content-enter-to,
.n-confirm-content-leave-from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
</style>
