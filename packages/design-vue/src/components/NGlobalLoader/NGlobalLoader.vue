<template>
  <Teleport to="body">
    <Transition name="n-global-loader">
      <div
        v-if="isVisible"
        class="n-global-loader"
        role="status"
        aria-label="로딩 중"
        aria-live="polite"
        aria-busy="true"
      >
        <div class="n-global-loader__backdrop" />
        <div class="n-global-loader__content">
          <NSpinner :size="size" color="primary" />
          <p v-if="message" class="n-global-loader__message">{{ message }}</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NSpinner } from '../NSpinner'

export interface NGlobalLoaderProps {
  modelValue?: boolean
  loading?: boolean
  size?: 'sm' | 'md' | 'lg'
  message?: string
}

const props = withDefaults(defineProps<NGlobalLoaderProps>(), {
  modelValue: false,
  loading: false,
  size: 'lg',
  message: undefined,
})

const isVisible = computed(() => props.modelValue || props.loading)
</script>

<style scoped>
.n-global-loader {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.n-global-loader__backdrop {
  position: absolute;
  inset: 0;
  background-color: rgb(0 0 0 / 0.4);
}

.n-global-loader__content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-4, 1rem);
}

.n-global-loader__message {
  margin: 0;
  font-family: var(--font-fontFamily-sans, sans-serif);
  font-size: var(--font-fontSize-sm, 0.875rem);
  color: var(--color-neutral-0, #ffffff);
  font-weight: var(--font-fontWeight-medium, 500);
}

.n-global-loader-enter-active,
.n-global-loader-leave-active {
  transition: opacity 200ms ease;
}

.n-global-loader-enter-from,
.n-global-loader-leave-to {
  opacity: 0;
}
</style>
