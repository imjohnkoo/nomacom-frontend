import { ref } from 'vue'

export interface UseCopyToClipboardOptions {
  duration?: number
}

export function useCopyToClipboard(options: UseCopyToClipboardOptions = {}) {
  const { duration = 2000 } = options
  const copied = ref(false)
  let timer: ReturnType<typeof setTimeout> | null = null

  async function copy(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text)
      copied.value = true
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => { copied.value = false }, duration)
      return true
    } catch {
      // Fallback
      try {
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
        copied.value = true
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => { copied.value = false }, duration)
        return true
      } catch {
        return false
      }
    }
  }

  return { copied, copy }
}
