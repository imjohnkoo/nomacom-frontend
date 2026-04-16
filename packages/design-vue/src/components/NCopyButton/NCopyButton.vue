<template>
  <button
    :class="[
      'n-copy-button',
      `n-copy-button--${variant}`,
      `n-copy-button--${size}`,
      { 'n-copy-button--copied': copied },
    ]"
    type="button"
    @click="handleCopy"
  >
    <svg v-if="copied" class="n-copy-button__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
    <svg v-else class="n-copy-button__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
    <span class="n-copy-button__label">{{ copied ? copiedText : label }}</span>
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue'

export interface NCopyButtonProps {
  value: string
  label?: string
  copiedText?: string
  variant?: 'primary' | 'outline' | 'ghost'
  size?: 'sm' | 'md'
  duration?: number
}

const props = withDefaults(defineProps<NCopyButtonProps>(), {
  label: '복사하기',
  copiedText: '복사됨',
  variant: 'primary',
  size: 'sm',
  duration: 2000,
})

const emit = defineEmits<{
  copy: [value: string]
}>()

const copied = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null

async function handleCopy() {
  try {
    await navigator.clipboard.writeText(props.value)
    copied.value = true
    emit('copy', props.value)
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => { copied.value = false }, props.duration)
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea')
    textarea.value = props.value
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    copied.value = true
    emit('copy', props.value)
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => { copied.value = false }, props.duration)
  }
}
</script>

<style scoped>
.n-copy-button {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1, 0.25rem);
  border: var(--borderWidth-1, 1px) solid transparent;
  border-radius: var(--radius-full, 9999px);
  font-family: var(--font-fontFamily-sans, sans-serif);
  font-weight: var(--font-fontWeight-medium, 500);
  cursor: pointer;
  transition: all var(--transition-fast, 150ms ease);
  outline: none;
  white-space: nowrap;
}

.n-copy-button--sm {
  padding: var(--spacing-1, 0.25rem) var(--spacing-3, 0.75rem);
  font-size: var(--font-fontSize-xs, 0.75rem);
}
.n-copy-button--md {
  padding: var(--spacing-2, 0.5rem) var(--spacing-4, 1rem);
  font-size: var(--font-fontSize-sm, 0.875rem);
}

.n-copy-button--primary {
  background-color: var(--color-primary-600, #5530e6);
  color: var(--color-neutral-0, #ffffff);
}
.n-copy-button--primary:hover { background-color: var(--color-primary-700, #4826cc); }

.n-copy-button--outline {
  background-color: transparent;
  border-color: var(--color-neutral-300, #d4d4d4);
  color: var(--color-neutral-700, #404040);
}
.n-copy-button--outline:hover {
  background-color: var(--color-neutral-50, #fafafa);
}

.n-copy-button--ghost {
  background-color: transparent;
  color: var(--color-neutral-600, #525252);
}
.n-copy-button--ghost:hover {
  background-color: var(--color-neutral-100, #f5f5f5);
}

.n-copy-button--copied {
  background-color: var(--color-success-500, #22c55e) !important;
  border-color: var(--color-success-500, #22c55e) !important;
  color: var(--color-neutral-0, #ffffff) !important;
}

.n-copy-button__icon {
  flex-shrink: 0;
}

.n-copy-button:focus-visible {
  box-shadow: 0 0 0 2px var(--color-primary-200, #ddd6fe);
}
</style>
