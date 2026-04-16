<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <Transition name="n-alert-dialog-backdrop">
        <DialogOverlay v-if="open" class="n-alert-dialog__overlay" />
      </Transition>
      <Transition name="n-alert-dialog-content">
        <DialogContent v-if="open" class="n-alert-dialog__content">
          <DialogClose v-if="closable" class="n-alert-dialog__close" aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <line x1="4" y1="4" x2="12" y2="12" />
              <line x1="12" y1="4" x2="4" y2="12" />
            </svg>
          </DialogClose>
          <div class="n-alert-dialog__body">
            <div v-if="$slots.icon" class="n-alert-dialog__icon">
              <slot name="icon" />
            </div>
            <div :class="['n-alert-dialog__icon-default', `n-alert-dialog__icon-default--${color}`]" v-else-if="!$slots.icon">
              <svg v-if="color === 'error' || color === 'warning'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <svg v-else-if="color === 'success'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="9 12 11.5 14.5 16 10" />
              </svg>
              <svg v-else width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </div>
            <DialogTitle v-if="title" class="n-alert-dialog__title">{{ title }}</DialogTitle>
            <DialogDescription v-if="description" class="n-alert-dialog__description">{{ description }}</DialogDescription>
            <slot />
          </div>
          <div v-if="$slots.actions" class="n-alert-dialog__actions">
            <slot name="actions" />
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
  DialogClose,
} from 'reka-ui'
import type { NColor } from '../../types/common'

export interface NAlertDialogProps {
  title?: string
  description?: string
  color?: NColor
  closable?: boolean
  modelValue?: boolean
}

withDefaults(defineProps<NAlertDialogProps>(), {
  title: undefined,
  description: undefined,
  color: 'info',
  closable: true,
  modelValue: undefined,
})

defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const open = defineModel<boolean>({ default: false })
</script>

<style>
.n-alert-dialog__overlay {
  position: fixed;
  inset: 0;
  z-index: var(--zIndex-modal-backdrop, 1040);
  background-color: rgb(0 0 0 / 0.5);
}

.n-alert-dialog__content {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: var(--zIndex-modal, 1050);
  width: 90vw;
  max-width: 380px;
  border-radius: var(--radius-xl, 0.75rem);
  background-color: var(--color-neutral-0, #ffffff);
  box-shadow: var(--shadow-xl, 0 20px 25px -5px rgb(0 0 0 / 0.1));
  font-family: var(--font-fontFamily-sans, sans-serif);
  overflow: hidden;
}

.n-alert-dialog__content:focus { outline: none; }

.n-alert-dialog__close {
  position: absolute;
  top: var(--spacing-3, 0.75rem);
  right: var(--spacing-3, 0.75rem);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: var(--radius-sm, 0.25rem);
  background: transparent;
  color: var(--color-neutral-400, #a3a3a3);
  cursor: pointer;
  transition: background-color var(--transition-fast, 150ms);
}
.n-alert-dialog__close:hover {
  background-color: var(--color-neutral-100, #f5f5f5);
  color: var(--color-neutral-700, #404040);
}

.n-alert-dialog__body {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--spacing-8, 2rem) var(--spacing-6, 1.5rem) var(--spacing-6, 1.5rem);
}

.n-alert-dialog__icon {
  margin-bottom: var(--spacing-3, 0.75rem);
}

.n-alert-dialog__icon-default {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full, 9999px);
  margin-bottom: var(--spacing-3, 0.75rem);
}

.n-alert-dialog__icon-default--error {
  background-color: var(--color-error-50, #fef2f2);
  color: var(--color-error-500, #ef4444);
}
.n-alert-dialog__icon-default--warning {
  background-color: var(--color-warning-50, #fffbeb);
  color: var(--color-warning-500, #f59e0b);
}
.n-alert-dialog__icon-default--success {
  background-color: var(--color-success-50, #f0fdf4);
  color: var(--color-success-500, #22c55e);
}
.n-alert-dialog__icon-default--info {
  background-color: var(--color-info-50, #f0f9ff);
  color: var(--color-info-500, #0ea5e9);
}
.n-alert-dialog__icon-default--primary {
  background-color: var(--color-primary-50, #f5f3ff);
  color: var(--color-primary-500, #6239FF);
}
.n-alert-dialog__icon-default--neutral {
  background-color: var(--color-neutral-100, #f5f5f5);
  color: var(--color-neutral-500, #737373);
}

.n-alert-dialog__title {
  margin: 0;
  font-size: var(--font-fontSize-lg, 1.125rem);
  font-weight: var(--font-fontWeight-semibold, 600);
  color: var(--color-neutral-900, #171717);
  line-height: 1.4;
}

.n-alert-dialog__description {
  margin-top: var(--spacing-1, 0.25rem);
  font-size: var(--font-fontSize-sm, 0.875rem);
  color: var(--color-neutral-500, #737373);
  line-height: 1.5;
}

.n-alert-dialog__actions {
  display: flex;
  justify-content: center;
  gap: var(--spacing-3, 0.75rem);
  padding: 0 var(--spacing-6, 1.5rem) var(--spacing-6, 1.5rem);
}

/* Transitions */
.n-alert-dialog-backdrop-enter-active,
.n-alert-dialog-backdrop-leave-active { transition: opacity 200ms ease; }
.n-alert-dialog-backdrop-enter-from,
.n-alert-dialog-backdrop-leave-to { opacity: 0; }

.n-alert-dialog-content-enter-active,
.n-alert-dialog-content-leave-active { transition: opacity 200ms ease, transform 200ms ease; }
.n-alert-dialog-content-enter-from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
.n-alert-dialog-content-leave-to { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
.n-alert-dialog-content-enter-to,
.n-alert-dialog-content-leave-from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
</style>
