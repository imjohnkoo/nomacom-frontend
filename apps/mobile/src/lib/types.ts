/**
 * Wire 타입 re-export — `nomacom-client` workspace 패키지의 `app/types/*` 를 직접 의존.
 *
 * 이 파일이 type-check 통과하면 PR1 의 "workspace 직접 의존 (mobile → client server route 타입)"
 * 의 핵심 가치 검증 완료. 별도 codegen / OpenAPI 없이 client 와 mobile 이 같은 wire 인터페이스 공유.
 *
 * client 측 변경 시 mobile 도 즉시 타입 깨짐 (단일 소스).
 */
export type {
  VerifyOrderRequest,
  VerifyOrderResponse,
  ActivateOrderRequest,
  ActivateOrderResponse,
} from 'nomacom-client/types/api'

export type { Order, Esim } from 'nomacom-client/types/order'
