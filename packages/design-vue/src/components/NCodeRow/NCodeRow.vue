<template>
  <div class="n-code-row">
    <div class="n-code-row__info">
      <span class="n-code-row__label">{{ label }}</span>
      <span class="n-code-row__value">{{ value }}</span>
    </div>
    <button
      type="button"
      :class="['n-code-row__copy', { 'n-code-row__copy--copied': copied }]"
      @click="onCopy"
    >
      <svg
        v-if="!copied"
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.4"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </svg>
      <svg
        v-else
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
      {{ copied ? copiedLabel : copyLabel }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

export interface NCodeRowProps {
  label: string
  value: string
  copyLabel?: string
  copiedLabel?: string
}

const props = withDefaults(defineProps<NCodeRowProps>(), {
  copyLabel: '복사',
  copiedLabel: '복사됨',
})

const emit = defineEmits<{ copied: [value: string] }>()

const copied = ref(false)
async function onCopy() {
  try {
    await navigator.clipboard.writeText(props.value)
  } catch {
    /* ignore */
  }
  copied.value = true
  emit('copied', props.value)
  setTimeout(() => {
    copied.value = false
  }, 1400)
}
</script>

<style scoped>
.n-code-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 0;
  border-bottom: 1px solid var(--color-neutral-100, #f3f4f6);
  font-family: var(--font-fontFamily-sans, sans-serif);
}

.n-code-row:last-of-type {
  border-bottom: 0;
}

.n-code-row__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.n-code-row__label {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-neutral-400, #a3a3a3);
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.n-code-row__value {
  font-size: 13px;
  color: var(--color-neutral-900, #171717);
  font-family: var(--font-fontFamily-mono, ui-monospace, SFMono-Regular, Menlo, monospace);
  word-break: break-all;
  line-height: 1.5;
}

.n-code-row__copy {
  flex-shrink: 0;
  height: 32px;
  padding: 0 12px;
  border: 0;
  border-radius: var(--radius-lg, 0.5rem);
  background: var(--color-primary-50, #f1edff);
  color: var(--color-primary-500, #6239ff);
  font-size: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition:
    background 160ms ease,
    color 160ms ease;
}

.n-code-row__copy:hover {
  background: var(--color-primary-100, #e3dbff);
}

.n-code-row__copy--copied {
  background: var(--color-success-50, #dcfce7);
  color: var(--color-success-700, #059669);
}
</style>
