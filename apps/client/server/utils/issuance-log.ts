/**
 * 발급 경로 구조화 로그 — backend 표준 이벤트 세트 (764c668) 와 동일 어휘.
 * CloudWatch 에서 발급 주체 (backend/client) 무관 단일 쿼리 추적용.
 *
 * 규약: JSON 1줄/라인. 공통 필드 event/level/message, trace key 는
 * productOrderId/idempotencyKey/provider/subscriberId/esimId/planId/unitIndex,
 * 시간은 durationMs. PII (이름/전화) 와 QR 원문 (LPA/activationCode) 로그 금지.
 * Spark 토큰 URL 마스킹 필수.
 */

export type IssuanceLogLevel = 'info' | 'warn' | 'error';

// spark-api.maskSparkToken 과 동일 패턴 — 순환 import 회피를 위해 인라인
const maskToken = (s: string) => s.replace(/([?&]token=)[^&\s"']+/gi, '$1***');

export function logEvent(
  event: string,
  level: IssuanceLogLevel,
  message: string,
  meta: Record<string, unknown> = {},
): void {
  const line = JSON.stringify({ event, level, message: maskToken(message), ...meta });
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}
