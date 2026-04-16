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
        <DialogContent v-if="open" class="n-modal__content">
          <div class="n-modal__header">
            <slot name="header">
              <DialogTitle v-if="title" class="n-modal__title">
                {{ title }}
              </DialogTitle>
              <DialogDescription v-if="description" class="n-modal__description">
                {{ description }}
              </DialogDescription>
            </slot>
            <DialogClose class="n-modal__close" aria-label="Close">
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

export interface NModalProps {
  /** Dialog title displayed in the header */
  title?: string
  /** Dialog description displayed below the title */
  description?: string
  /** Controlled open state (v-model) */
  modelValue?: boolean
}

withDefaults(defineProps<NModalProps>(), {
  title: undefined,
  description: undefined,
  modelValue: undefined,
})

defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const open = defineModel<boolean>({ default: false })
</script>

<style>
.n-modal__overlay {
  position: fixed;
  inset: 0;
  z-index: var(--zIndex-modal-backdrop, 1040);
  background-color: rgb(0 0 0 / 0.5);
}

.n-modal__content {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: var(--zIndex-modal, 1050);
  width: 90vw;
  max-width: 520px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-xl, 0.75rem);
  background-color: var(--color-neutral-0, #ffffff);
  box-shadow: var(--shadow-xl, 0 20px 25px -5px rgb(0 0 0 / 0.1));
  font-family: var(--font-fontFamily-sans, sans-serif);
  color: var(--color-neutral-800, #1f2937);
  overflow: hidden;
}

.n-modal__content:focus {
  outline: none;
}

.n-modal__header {
  position: relative;
  padding: var(--spacing-5, 1.25rem) var(--spacing-6, 1.5rem);
  padding-right: var(--spacing-12, 3rem);
  border-bottom: var(--borderWidth-1, 1px) solid var(--color-neutral-200, #e5e7eb);
}

.n-modal__title {
  margin: 0;
  font-size: var(--font-fontSize-lg, 1.125rem);
  font-weight: var(--font-fontWeight-semibold, 600);
  color: var(--color-neutral-900, #111827);
  line-height: 1.4;
}

.n-modal__description {
  margin-top: var(--spacing-1, 0.25rem);
  font-size: var(--font-fontSize-sm, 0.875rem);
  color: var(--color-neutral-500, #6b7280);
  line-height: 1.5;
}

.n-modal__close {
  position: absolute;
  top: var(--spacing-4, 1rem);
  right: var(--spacing-4, 1rem);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: var(--radius-sm, 0.25rem);
  background: transparent;
  color: var(--color-neutral-500, #6b7280);
  cursor: pointer;
  transition: background-color var(--transition-fast, 150ms);
}

.n-modal__close:hover {
  background-color: var(--color-neutral-100, #f3f4f6);
  color: var(--color-neutral-700, #374151);
}

.n-modal__close:focus-visible {
  outline: 2px solid var(--color-primary-500, #3b82f6);
  outline-offset: 2px;
}

.n-modal__body {
  flex: 1;
  padding: var(--spacing-5, 1.25rem) var(--spacing-6, 1.5rem);
  overflow-y: auto;
  font-size: var(--font-fontSize-sm, 0.875rem);
  line-height: 1.5;
}

.n-modal__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--spacing-3, 0.75rem);
  padding: var(--spacing-4, 1rem) var(--spacing-6, 1.5rem);
  border-top: var(--borderWidth-1, 1px) solid var(--color-neutral-200, #e5e7eb);
}

/* --- Transition: Backdrop --- */
.n-modal-backdrop-enter-active,
.n-modal-backdrop-leave-active {
  transition: opacity var(--transition-normal, 200ms) ease;
}
.n-modal-backdrop-enter-from,
.n-modal-backdrop-leave-to {
  opacity: 0;
}

/* --- Transition: Content --- */
.n-modal-content-enter-active,
.n-modal-content-leave-active {
  transition: opacity var(--transition-normal, 200ms) ease,
              transform var(--transition-normal, 200ms) ease;
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
