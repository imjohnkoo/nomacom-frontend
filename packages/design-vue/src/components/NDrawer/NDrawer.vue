<template>
  <DialogRoot v-model:open="open">
    <DialogTrigger v-if="$slots.default" as-child>
      <slot />
    </DialogTrigger>
    <DialogPortal>
      <Transition name="n-drawer-backdrop">
        <DialogOverlay v-if="open" class="n-drawer__overlay" />
      </Transition>
      <Transition :name="`n-drawer-slide-${side}`">
        <DialogContent
          v-if="open"
          :class="['n-drawer__content', `n-drawer__content--${side}`]"
        >
          <div class="n-drawer__header">
            <slot name="header">
              <DialogTitle v-if="title" class="n-drawer__title">
                {{ title }}
              </DialogTitle>
              <DialogDescription v-if="description" class="n-drawer__description">
                {{ description }}
              </DialogDescription>
            </slot>
            <DialogClose class="n-drawer__close" aria-label="Close">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <line x1="4" y1="4" x2="12" y2="12" />
                <line x1="12" y1="4" x2="4" y2="12" />
              </svg>
            </DialogClose>
          </div>
          <div class="n-drawer__body">
            <slot name="body" />
          </div>
          <div v-if="$slots.footer" class="n-drawer__footer">
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

export interface NDrawerProps {
  /** Drawer title displayed in the header */
  title?: string
  /** Drawer description displayed below the title */
  description?: string
  /** Controlled open state (v-model) */
  modelValue?: boolean
  /** Side from which the drawer slides in */
  side?: 'left' | 'right' | 'top' | 'bottom'
}

withDefaults(defineProps<NDrawerProps>(), {
  title: undefined,
  description: undefined,
  modelValue: undefined,
  side: 'right',
})

defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const open = defineModel<boolean>({ default: false })
</script>

<style>
.n-drawer__overlay {
  position: fixed;
  inset: 0;
  z-index: var(--n-z-index-modal-backdrop, 1040);
  background-color: rgb(0 0 0 / 0.5);
}

.n-drawer__content {
  position: fixed;
  z-index: var(--n-z-index-modal, 1050);
  display: flex;
  flex-direction: column;
  background-color: var(--n-color-neutral-0, #ffffff);
  box-shadow: var(--n-shadow-xl, 0 20px 25px -5px rgba(0, 0, 0, 0.1));
  font-family: var(--n-font-family-sans, 'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Segoe UI', 'Noto Sans KR', sans-serif);
  color: var(--n-color-neutral-800, #262626);
  overflow: hidden;
}

.n-drawer__content:focus {
  outline: none;
}

/* --- Side positions --- */
.n-drawer__content--right {
  top: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  max-width: 400px;
}

.n-drawer__content--left {
  top: 0;
  left: 0;
  bottom: 0;
  width: 100%;
  max-width: 400px;
}

.n-drawer__content--top {
  top: 0;
  left: 0;
  right: 0;
  height: auto;
  max-height: 80vh;
}

.n-drawer__content--bottom {
  bottom: 0;
  left: 0;
  right: 0;
  height: auto;
  max-height: 80vh;
}

.n-drawer__header {
  position: relative;
  padding: var(--n-spacing-5, 1.25rem) var(--n-spacing-6, 1.5rem);
  padding-right: var(--n-spacing-12, 3rem);
  border-bottom: var(--n-border-width-1, 1px) solid var(--n-color-neutral-200, #e5e5e5);
}

.n-drawer__title {
  margin: 0;
  font-size: var(--n-font-size-lg, 1.125rem);
  font-weight: var(--n-font-weight-semibold, 600);
  color: var(--n-color-neutral-900, #171717);
  line-height: 1.4;
}

.n-drawer__description {
  margin-top: var(--n-spacing-1, 0.25rem);
  font-size: var(--n-font-size-sm, 0.875rem);
  color: var(--n-color-neutral-500, #737373);
  line-height: 1.5;
}

.n-drawer__close {
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

.n-drawer__close:hover {
  background-color: var(--n-color-neutral-100, #f5f5f5);
  color: var(--n-color-neutral-700, #404040);
}

.n-drawer__close:focus-visible {
  outline: 2px solid var(--n-color-primary-500, #6239FF);
  outline-offset: 2px;
}

.n-drawer__body {
  flex: 1;
  padding: var(--n-spacing-5, 1.25rem) var(--n-spacing-6, 1.5rem);
  overflow-y: auto;
  font-size: var(--n-font-size-sm, 0.875rem);
  line-height: 1.5;
}

.n-drawer__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--n-spacing-3, 0.75rem);
  padding: var(--n-spacing-4, 1rem) var(--n-spacing-6, 1.5rem);
  border-top: var(--n-border-width-1, 1px) solid var(--n-color-neutral-200, #e5e5e5);
}

/* --- Transition: Backdrop --- */
.n-drawer-backdrop-enter-active,
.n-drawer-backdrop-leave-active {
  transition: opacity var(--n-transition-normal, 250ms ease) ease;
}
.n-drawer-backdrop-enter-from,
.n-drawer-backdrop-leave-to {
  opacity: 0;
}

/* --- Slide transitions --- */
.n-drawer-slide-right-enter-active,
.n-drawer-slide-right-leave-active,
.n-drawer-slide-left-enter-active,
.n-drawer-slide-left-leave-active,
.n-drawer-slide-top-enter-active,
.n-drawer-slide-top-leave-active,
.n-drawer-slide-bottom-enter-active,
.n-drawer-slide-bottom-leave-active {
  transition: transform var(--n-transition-normal, 250ms ease) ease;
}

.n-drawer-slide-right-enter-from,
.n-drawer-slide-right-leave-to {
  transform: translateX(100%);
}

.n-drawer-slide-left-enter-from,
.n-drawer-slide-left-leave-to {
  transform: translateX(-100%);
}

.n-drawer-slide-top-enter-from,
.n-drawer-slide-top-leave-to {
  transform: translateY(-100%);
}

.n-drawer-slide-bottom-enter-from,
.n-drawer-slide-bottom-leave-to {
  transform: translateY(100%);
}
</style>
