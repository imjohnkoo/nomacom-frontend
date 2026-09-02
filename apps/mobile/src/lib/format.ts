/**
 * client `app/utils/formatter.ts` 포팅 — 동작 동일 유지 (검증 규칙이 서버 대조와 짝).
 * wire 타입과 달리 UI 유틸은 client package exports (`./types/*` 한정) 밖이라 포팅으로 공유.
 */

/** 010-XXXX-XXXX 자동 하이픈 (13자 제한) */
export const formatPhoneNumber = (value: string): string => {
  const numbers = value.replace(/[^\d]/g, '')

  const charArray = numbers.split('')
  if (charArray.length > 3) {
    charArray.splice(3, 0, '-')
  }
  if (charArray.length > 8) {
    charArray.splice(8, 0, '-')
  }

  return charArray.join('').slice(0, 13)
}

export const isValidPhoneNumber = (value: string): boolean => {
  return /^010-\d{4}-\d{4}$/.test(value)
}
