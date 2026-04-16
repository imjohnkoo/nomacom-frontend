import { ref } from 'vue'

export interface ToastOptions {
  /** Toast title */
  title?: string
  /** Toast description */
  description?: string
  /** Semantic color */
  color?: 'primary' | 'neutral' | 'success' | 'warning' | 'error' | 'info'
  /** Auto-dismiss duration in ms (0 to disable) */
  duration?: number
}

export interface ToastInstance extends Required<Pick<ToastOptions, 'color' | 'duration'>> {
  id: string
  title?: string
  description?: string
}

const toasts = ref<ToastInstance[]>([])
let counter = 0

function add(options: ToastOptions): string {
  const id = `toast-${++counter}-${Date.now()}`
  const instance: ToastInstance = {
    id,
    title: options.title,
    description: options.description,
    color: options.color ?? 'neutral',
    duration: options.duration ?? 5000,
  }
  toasts.value.push(instance)
  return id
}

function remove(id: string): void {
  const index = toasts.value.findIndex((t) => t.id === id)
  if (index !== -1) {
    toasts.value.splice(index, 1)
  }
}

function clear(): void {
  toasts.value.splice(0)
}

export function useToast() {
  return {
    /** Reactive list of active toasts */
    toasts,
    /** Add a new toast notification and return its id */
    add,
    /** Remove a toast by id */
    remove,
    /** Remove all active toasts */
    clear,
  }
}
