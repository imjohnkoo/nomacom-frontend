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
  z-index: var(--n-z-index-modal-backdrop, 1040);
  background-color: rgb(0 0 0 / 0.5);
}

.n-slideover__content {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: var(--n-z-index-modal, 1050);
  display: flex;
  flex-direction: column;
  max-width: 100vw;
  background-color: var(--n-color-neutral-0, #ffffff);
  box-shadow: var(--n-shadow-xl, 0 20px 25px -5px rgba(0, 0, 0, 0.1));
  font-family: var(--n-font-family-sans, 'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Segoe UI', 'Noto Sans KR', sans-serif);
  color: var(--n-color-neutral-800, #262626);
  overflow: hidden;
}

.n-slideover__content:focus {
  outline: none;
}

.n-slideover__header {
  position: relative;
  display: flex;
  align-items: center;
  padding: var(--n-spacing-5, 1.25rem) var(--n-spacing-6, 1.5rem);
  padding-right: var(--n-spacing-12, 3rem);
  border-bottom: var(--n-border-width-1, 1px) solid var(--n-color-neutral-200, #e5e5e5);
}

.n-slideover__title {
  margin: 0;
  font-size: var(--n-font-size-lg, 1.125rem);
  font-weight: var(--n-font-weight-semibold, 600);
  color: var(--n-color-neutral-900, #171717);
  line-height: 1.4;
}

.n-slideover__close {
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

.n-slideover__close:hover {
  background-color: var(--n-color-neutral-100, #f5f5f5);
  color: var(--n-color-neutral-700, #404040);
}

.n-slideover__close:focus-visible {
  outline: 2px solid var(--n-color-primary-500, #6239FF);
  outline-offset: 2px;
}

.n-slideover__body {
  flex: 1;
  padding: var(--n-spacing-5, 1.25rem) var(--n-spacing-6, 1.5rem);
  overflow-y: auto;
  font-size: var(--n-font-size-sm, 0.875rem);
  line-height: 1.5;
}

.n-slideover__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--n-spacing-3, 0.75rem);
  padding: var(--n-spacing-4, 1rem) var(--n-spacing-6, 1.5rem);
  border-top: var(--n-border-width-1, 1px) solid var(--n-color-neutral-200, #e5e5e5);
}

/* --- Transition: Backdrop --- */
.n-slideover-backdrop-enter-active,
.n-slideover-backdrop-leave-active {
  transition: opacity var(--n-transition-normal, 250ms ease) ease;
}
.n-slideover-backdrop-enter-from,
.n-slideover-backdrop-leave-to {
  opacity: 0;
}

/* --- Transition: Panel --- */
.n-slideover-panel-enter-active,
.n-slideover-panel-leave-active {
  transition: transform var(--n-transition-normal, 250ms ease) ease;
}
.n-slideover-panel-enter-from,
.n-slideover-panel-leave-to {
  transform: translateX(100%);
}
</style>
