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
  gap: var(--n-spacing-1, 0.25rem);
  border: var(--n-border-width-1, 1px) solid transparent;
  border-radius: var(--n-radius-full, 9999px);
  font-family: var(--n-font-family-sans, 'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Segoe UI', 'Noto Sans KR', sans-serif);
  font-weight: var(--n-font-weight-medium, 500);
  cursor: pointer;
  transition: all var(--n-transition-fast, 150ms ease);
  outline: none;
  white-space: nowrap;
}

.n-copy-button--sm {
  padding: var(--n-spacing-1, 0.25rem) var(--n-spacing-3, 0.75rem);
  font-size: var(--n-font-size-xs, 0.75rem);
}
.n-copy-button--md {
  padding: var(--n-spacing-2, 0.5rem) var(--n-spacing-4, 1rem);
  font-size: var(--n-font-size-sm, 0.875rem);
}

.n-copy-button--primary {
  background-color: var(--n-color-primary-600, #5025e8);
  color: var(--n-color-neutral-0, #ffffff);
}
.n-copy-button--primary:hover { background-color: var(--n-color-primary-700, #3f1cc0); }

.n-copy-button--outline {
  background-color: transparent;
  border-color: var(--n-color-neutral-300, #d4d4d4);
  color: var(--n-color-neutral-700, #404040);
}
.n-copy-button--outline:hover {
  background-color: var(--n-color-neutral-50, #fafafa);
}

.n-copy-button--ghost {
  background-color: transparent;
  color: var(--n-color-neutral-600, #525252);
}
.n-copy-button--ghost:hover {
  background-color: var(--n-color-neutral-100, #f5f5f5);
}

.n-copy-button--copied {
  background-color: var(--n-color-success-500, #22c55e) !important;
  border-color: var(--n-color-success-500, #22c55e) !important;
  color: var(--n-color-neutral-0, #ffffff) !important;
}

.n-copy-button__icon {
  flex-shrink: 0;
}

.n-copy-button:focus-visible {
  box-shadow: 0 0 0 2px var(--n-color-primary-200, #c7b6ff);
}
</style>
