<template>
  <ToastProvider :swipe-direction="swipeDirection">
    <slot />

    <ToastViewport class="n-toast-viewport">
      <NToast
        v-for="toast in toasts"
        :key="toast.id"
        :title="toast.title"
        :description="toast.description"
        :color="toast.color"
        :duration="toast.duration"
        @close="remove(toast.id)"
      />
    </ToastViewport>
  </ToastProvider>
</template>

<script setup lang="ts">
import { ToastProvider, ToastViewport } from 'reka-ui'
import NToast from './NToast.vue'
import { useToast } from './useToast'

export interface NToastProviderProps {
  /** Direction for swipe-to-dismiss */
  swipeDirection?: 'right' | 'left' | 'up' | 'down'
}

withDefaults(defineProps<NToastProviderProps>(), {
  swipeDirection: 'right',
})

const { toasts, remove } = useToast()
</script>

<style>
.n-toast-viewport {
  position: fixed;
  bottom: 0;
  right: 0;
  z-index: var(--zIndex-toast, 1200);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3, 0.75rem);
  padding: var(--spacing-6, 1.5rem);
  margin: 0;
  list-style: none;
  max-height: 100vh;
  outline: none;
  pointer-events: none;
}

.n-toast-viewport > * {
  pointer-events: auto;
}
</style>
