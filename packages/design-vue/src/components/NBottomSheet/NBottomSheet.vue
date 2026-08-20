<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <Transition name="n-bottom-sheet-backdrop">
        <DialogOverlay v-if="open" class="n-bottom-sheet__overlay" />
      </Transition>
      <Transition name="n-bottom-sheet-content">
        <DialogContent v-if="open" class="n-bottom-sheet__content">
          <div v-if="grip" class="n-bottom-sheet__grip" aria-hidden="true" />
          <header v-if="title || $slots.header" class="n-bottom-sheet__header">
            <slot name="header">
              <DialogTitle v-if="title" class="n-bottom-sheet__title">{{ title }}</DialogTitle>
            </slot>
          </header>
          <div class="n-bottom-sheet__body">
            <slot />
          </div>
          <footer v-if="$slots.footer" class="n-bottom-sheet__footer">
            <slot name="footer" />
          </footer>
        </DialogContent>
      </Transition>
    </DialogPortal>
  </DialogRoot>
</template>

<script setup lang="ts">
import { DialogRoot, DialogPortal, DialogOverlay, DialogContent, DialogTitle } from 'reka-ui'

export interface NBottomSheetProps {
  title?: string
  grip?: boolean
  maxWidth?: number | string
}

withDefaults(defineProps<NBottomSheetProps>(), {
  title: undefined,
  grip: true,
  maxWidth: 420,
})

const open = defineModel<boolean>({ default: false })
</script>

<style>
.n-bottom-sheet__overlay {
  position: fixed;
  inset: 0;
  z-index: var(--n-z-index-modal-backdrop, 1040);
  background-color: rgba(17, 17, 17, 0.32);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.n-bottom-sheet__content {
  position: fixed;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  z-index: var(--n-z-index-modal, 1050);
  width: 100%;
  max-width: 420px;
  padding: 12px 20px 22px;
  border-radius: var(--n-radius-3xl, 1.5rem) var(--n-radius-3xl, 1.5rem) 0 0;
  background-color: var(--n-color-neutral-0, #ffffff);
  box-shadow: 0 -10px 40px -10px rgba(0, 0, 0, 0.2);
  font-family: var(--n-font-family-sans, 'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Segoe UI', 'Noto Sans KR', sans-serif);
  max-height: 90vh;
  overflow: auto;
}

.n-bottom-sheet__content:focus {
  outline: none;
}

.n-bottom-sheet__grip {
  width: 44px;
  height: 4px;
  border-radius: var(--n-radius-full, 9999px);
  background-color: var(--n-color-neutral-200, #e5e5e5);
  margin: 0 auto 16px;
}

.n-bottom-sheet__header {
  margin-bottom: 12px;
}

.n-bottom-sheet__title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--n-color-neutral-900, #171717);
  text-align: center;
}

.n-bottom-sheet__footer {
  margin-top: 16px;
}

/* Transitions */
.n-bottom-sheet-backdrop-enter-active,
.n-bottom-sheet-backdrop-leave-active {
  transition: opacity 200ms ease;
}
.n-bottom-sheet-backdrop-enter-from,
.n-bottom-sheet-backdrop-leave-to {
  opacity: 0;
}

.n-bottom-sheet-content-enter-active,
.n-bottom-sheet-content-leave-active {
  transition:
    transform 260ms cubic-bezier(0.2, 0.7, 0.2, 1),
    opacity 220ms ease;
}
.n-bottom-sheet-content-enter-from {
  opacity: 0.6;
  transform: translateX(-50%) translateY(24px);
}
.n-bottom-sheet-content-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(24px);
}
</style>
