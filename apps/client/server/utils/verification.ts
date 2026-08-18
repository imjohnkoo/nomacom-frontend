/**
 * 수신자 본인 확인 (verify) 용 정규화 + 대조 로직.
 *
 * - 전화번호: 숫자만 남겨 비교 — 클라이언트 formatter 는 010-XXXX-XXXX 하이픈 포맷,
 *   DB (네이버 커머스 sync) 는 하이픈 유무가 혼재할 수 있음
 * - 이름: NFC 정규화 + 공백 제거 + 소문자 비교 — macOS 자모 분해 입력, 영문 수취인 대응
 */

export function normalizePhoneNumber(value: string | null | undefined): string {
  return (value ?? '').replace(/\D/g, '');
}

export function normalizeName(value: string | null | undefined): string {
  return (value ?? '').normalize('NFC').replace(/\s+/g, '').toLowerCase();
}

export function matchesReceiver(
  input: { fullName: string; phoneNumber: string },
  receiver: { receiverName: string | null; receiverPhoneNumber: string | null },
): boolean {
  const inputName = normalizeName(input.fullName);
  const inputPhone = normalizePhoneNumber(input.phoneNumber);

  // DB 수취인 정보가 비어 있는 주문은 fail-closed — 빈 입력끼리 일치로 통과 금지
  if (!inputName || !inputPhone) return false;

  return (
    inputName === normalizeName(receiver.receiverName) &&
    inputPhone === normalizePhoneNumber(receiver.receiverPhoneNumber)
  );
}
