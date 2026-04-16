import { ref } from 'vue'

const isLoading = ref(false)
let _depth = 0

function start(): void {
  _depth++
  isLoading.value = true
}

function stop(): void {
  _depth = Math.max(0, _depth - 1)
  if (_depth === 0) isLoading.value = false
}

function forceStop(): void {
  _depth = 0
  isLoading.value = false
}

export function useGlobalLoader() {
  return {
    isLoading,
    start,
    stop,
    forceStop,
  }
}
