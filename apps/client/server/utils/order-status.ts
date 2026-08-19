/**
 * 주문 취소/클레임 판정 — verify (표시) 와 activate (발급 가드) 가 동일 기준 공유.
 * CLAIM_REQUESTED = 취소 요청 접수 (미확정), CLAIM_COMPLETED = 취소 확정,
 * CANCEL* = 네이버 취소 계열 상태.
 */
export function isOrderCancelled(lastChangedType: string | null | undefined): boolean {
  if (!lastChangedType) return false;
  return (
    lastChangedType === 'CLAIM_REQUESTED' ||
    lastChangedType === 'CLAIM_COMPLETED' ||
    lastChangedType.startsWith('CANCEL')
  );
}
