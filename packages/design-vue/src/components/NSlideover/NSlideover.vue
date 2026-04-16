<template>
  <DialogRoot v-model:open="open">
    <DialogTrigger v-if="$slots.default" as-child>
      <slot />
    </DialogTrigger>
    <DialogPortal>
      <Transition name="n-slideover-backdrop">
        <DialogOverlay v-if="open" class="n-slideover__overlay" />
      </Transition>
      <Transition name="n-slideover-panel">
        <DialogContent
          v-if="open"
          class="n-slideover__content"
          :style="{ width }"
        >
          <div class="n-slideover__header">
            <slot name="header">
              <DialogTitle v-if="title" class="n-slideover__title">
                {{ title }}
              </DialogTitle>
            </slot>
            <DialogClose class="n-slideover__close" aria-label="Close">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <line x1="4" y1="4" x2="12" y2="12" />
                <line x1="12" y1="4" x2="4" y2="12" />
              </svg>
            </DialogClose>
          </div>
          <div class="n-slideover__body">
            <slot name="body" />
          </div>
          <div v-if="$slots.footer" class="n-slideover__footer">
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
  DialogClose,
} from 'reka-ui'

export interface NSlideoverProps {
  /** Panel title displayed in the header */
  title?: string
  /** Controlled open state (v-model) */
  modelValue?: boolean
  /** Width of the slide-over panel */
  width?: string
}

withDefaults(defineProps<NSlideoverProps>(), {
  title: undefined,
  modelValue: undefined,
  width: '400px',
})

defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const open = defineModel<boolean>({ default: false })
</script>

<style>
.n-slideover__overlay {
  position: fixed;
  inset: 0;
  z-index: var(--zIndex-modal-backdrop, 1040);
  background-color: rgb(0 0 0 / 0.5);
}

.n-slideover__content {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: var(--zIndex-modal, 1050);
  display: flex;
  flex-direction: column;
  max-width: 100vw;
  background-color: var(--color-neutral-0, #ffffff);
  box-shadow: var(--shadow-xl, 0 20px 25px -5px rgb(0 0 0 / 0.1));
  font-family: var(--font-fontFamily-sans, sans-serif);
  color: var(--color-neutral-800, #1f2937);
  overflow: hidden;
}

.n-slideover__content:focus {
  outline: none;
}

.n-slideover__header {
  position: relative;
  display: flex;
  align-items: center;
  padding: var(--spacing-5, 1.25rem) var(--spacing-6, 1.5rem);
  padding-right: var(--spacing-12, 3rem);
  border-bottom: var(--borderWidth-1, 1px) solid var(--color-neutral-200, #e5e7eb);
}

.n-slideover__title {
  margin: 0;
  font-size: var(--font-fontSize-lg, 1.125rem);
  font-weight: var(--font-fontWeight-semibold, 600);
  color: var(--color-neutral-900, #111827);
  line-height: 1.4;
}

.n-slideover__close {
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

.n-slideover__close:hover {
  background-color: var(--color-neutral-100, #f3f4f6);
  color: var(--color-neutral-700, #374151);
}

.n-slideover__close:focus-visible {
  outline: 2px solid var(--color-primary-500, #3b82f6);
  outline-offset: 2px;
}

.n-slideover__body {
  flex: 1;
  padding: var(--spacing-5, 1.25rem) var(--spacing-6, 1.5rem);
  overflow-y: auto;
  font-size: var(--font-fontSize-sm, 0.875rem);
  line-height: 1.5;
}

.n-slideover__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--spacing-3, 0.75rem);
  padding: var(--spacing-4, 1rem) var(--spacing-6, 1.5rem);
  border-top: var(--borderWidth-1, 1px) solid var(--color-neutral-200, #e5e7eb);
}

/* --- Transition: Backdrop --- */
.n-slideover-backdrop-enter-active,
.n-slideover-backdrop-leave-active {
  transition: opacity var(--transition-normal, 200ms) ease;
}
.n-slideover-backdrop-enter-from,
.n-slideover-backdrop-leave-to {
  opacity: 0;
}

/* --- Transition: Panel --- */
.n-slideover-panel-enter-active,
.n-slideover-panel-leave-active {
  transition: transform var(--transition-normal, 200ms) ease;
}
.n-slideover-panel-enter-from,
.n-slideover-panel-leave-to {
  transform: translateX(100%);
}
</style>
