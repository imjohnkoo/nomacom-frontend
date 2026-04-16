import { ref, computed } from 'vue'

export function usePhoneFormat(initialValue = '') {
  const raw = ref(initialValue.replace(/\D/g, ''))

  const formatted = computed(() => formatPhoneNumber(raw.value))

  const isValid = computed(() => {
    const digits = raw.value
    return /^01[016789]\d{7,8}$/.test(digits)
  })

  function handleInput(event: Event) {
    const input = event.target as HTMLInputElement
    const digits = input.value.replace(/\D/g, '').slice(0, 11)
    raw.value = digits
    input.value = formatPhoneNumber(digits)
  }

  function set(value: string) {
    raw.value = value.replace(/\D/g, '').slice(0, 11)
  }

  function clear() {
    raw.value = ''
  }

  return { raw, formatted, isValid, handleInput, set, clear }
}

function formatPhoneNumber(digits: string): string {
  if (digits.length <= 3) return digits
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`
}
