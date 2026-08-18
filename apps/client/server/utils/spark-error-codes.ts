/**
 * Spark(Telco-vision OCS) 공식 에러 코드 → 이름.
 * 출처: api-docs/spark-ocs-api/03-error-codes.md (upstream v1/API.md#error-codes, 2026-08-04 스냅샷)
 * 로그의 sparkCode 숫자를 외부 문서 대조 없이 판독하기 위한 매핑 — 코드 추가/변경 시 문서와 함께 갱신.
 * (backend apps/esim-manager/src/spark-api/spark-error-codes.ts 와 동일본 유지)
 */
export const SPARK_OCS_CODE_NAMES: Record<number, string> = {
  0: 'OK',
  1: 'UNKNOWN_REQUEST',
  2: 'INVALID_REQUEST',
  3: 'UNEXPECTED_ERROR',
  4: 'DB_DUPLICATE_ENTRY',
  5: 'DB_DATA_INCONSISTENCY',
  6: 'DB_NOT_FOUND',
  7: 'DB_ERROR',
  8: 'NO_API_ACCOUNT_FOR_RESELLER',
  9: 'SRC_IP_NOT_AUTHORISED',
  10: 'INVALID_RESELLER',
  11: 'RESOURCE_NOT_VISIBLE',
  12: 'RESOURCE_READ_ONLY',
  13: 'SMS_API_ERROR',
  14: 'OPERATION_IMPOSSIBLE',
  15: 'HLR_API_ERROR',
  16: 'STEERING_API_ERROR',
  17: 'SUBS_END_OF_LIFE',
  18: 'TIMEOUT',
  100: 'TRAFFIC_CONTROL_LIMIT_EXCEEDED',
};

/** 10001 대역 = 메서드 고유 코드 (해당 메서드 문서의 응답 예시 참조) */
export function sparkCodeName(code: number): string {
  if (code in SPARK_OCS_CODE_NAMES) return SPARK_OCS_CODE_NAMES[code];
  if (code >= 10001) return 'METHOD_SPECIFIC';
  return 'UNMAPPED';
}
