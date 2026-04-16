import { ref } from 'vue'

type ConfirmVariant = 'default' | 'danger'

export interface ConfirmOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: ConfirmVariant
}

interface ConfirmRequest {
  id: string
  options: Required<ConfirmOptions>
  resolve: (value: boolean) => void
}

const queue = ref<ConfirmRequest[]>([])
const current = ref<ConfirmRequest | null>(null)

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function normalizeOptions(options: ConfirmOptions): Required<ConfirmOptions> {
  return {
    title: options.title,
    message: options.message,
    confirmText: options.confirmText ?? '확인',
    cancelText: options.cancelText ?? '취소',
    variant: options.variant ?? 'default',
  }
}

function openNext(): void {
  if (current.value || queue.value.length === 0) return
  current.value = queue.value.shift() ?? null
}

function confirm(options: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    queue.value.push({
      id: makeId(),
      options: normalizeOptions(options),
      resolve,
    })
    openNext()
  })
}

function resolveCurrent(value: boolean): void {
  if (!current.value) return
  current.value.resolve(value)
  current.value = null
  openNext()
}

function onConfirm(): void {
  resolveCurrent(true)
}

function onCancel(): void {
  resolveCurrent(false)
}

function flushOnUnmount(): void {
  if (current.value) {
    current.value.resolve(false)
    current.value = null
  }
  for (const item of queue.value) {
    item.resolve(false)
  }
  queue.value = []
}

export function useConfirm() {
  return {
    current,
    queue,
    confirm,
    onConfirm,
    onCancel,
    flushOnUnmount,
  }
}
