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

/**
 * 주문 연락처 대조 — 군간 AND + 군내 OR (john 결정 2026-08-19).
 *
 * 이름은 {구매자명, 수령인명} 중 하나와, 전화는 {구매자 전화, 수령인 전화} 중
 * 하나와 일치해야 통과. 선물 주문 (결제자≠수령인, backend 2026-06 CS 이력) 을
 * 커버하면서 이름만으로는 통과할 수 없게 유지. backend 52dbf65 는 군간도 OR
 * (완전 OR) 로 더 느슨함 — client 는 의도적으로 군간 AND.
 */
export function matchesOrderContact(
  input: { fullName: string; phoneNumber: string },
  order: {
    customerName: string | null;
    customerPhoneNumber: string | null;
    receiverName: string | null;
    receiverPhoneNumber: string | null;
  },
): boolean {
  const inputName = normalizeName(input.fullName);
  const inputPhone = normalizePhoneNumber(input.phoneNumber);

  // 빈 입력은 fail-closed — DB 쪽 빈 값도 아래 filter 로 후보에서 제외
  if (!inputName || !inputPhone) return false;

  const nameMatch = [order.customerName, order.receiverName]
    .map(normalizeName)
    .filter(Boolean)
    .includes(inputName);

  const phoneMatch = [order.customerPhoneNumber, order.receiverPhoneNumber]
    .map(normalizePhoneNumber)
    .filter(Boolean)
    .includes(inputPhone);

  return nameMatch && phoneMatch;
}
