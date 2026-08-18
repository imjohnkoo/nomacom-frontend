/**
 * Spark (telco-vision OCS) API client — backend f9d9c41 스펙 대조 완료본 기준.
 *
 * Transport 규약:
 *  - POST {endpoint}?token={TOKEN}, body = {"메서드명": {...params}}
 *  - 성공 = status.code === 0, 응답 payload = body["메서드명"]
 *  - 실패도 HTTP 200 + status.code ≠ 0 로 올 수 있음
 *  - retryable 은 code 18 (TIMEOUT) / 100 (RATE) 만 — 나머지는 terminal.
 *    단 쓰기 (affect) 계열의 timeout 재시도는 이중 부여 위험 → 이 클라이언트는 자동 재시도하지 않음
 *  - 토큰이 URL 쿼리에 있으므로 로그/에러 메시지에서 반드시 마스킹
 *
 * 파라미터 형태 주의 (메서드마다 다름 — 실측):
 *  - affect 계열: subscriber 를 {subscriberId} 로 **중첩**
 *  - listSubscriberPrepaidPackages / getSingleSubscriber: **flat** {subscriberId} (중첩은 code 2 거절)
 */

import { sparkCodeName } from './spark-error-codes'
import { logEvent } from './issuance-log'

// 18 TIMEOUT 은 서버측 타임아웃 — 작업이 실제 수행됐을 수 있어 affect 재시도는
// 이중 부여 위험. 100 은 백오프 필수. retryable 플래그는 참고용이며 이 클라이언트는
// 자동 재시도하지 않음
const RETRYABLE_CODES = new Set([18, 100])

export class SparkApiError extends Error {
  code: number
  codeName: string
  retryable: boolean
  method: string

  constructor(method: string, code: number, message: string) {
    // 이름을 코드 옆에 — 원장 errorMessage 255자 절단에서도 이름이 살아남게
    super(`spark ${method} code=${code}(${sparkCodeName(code)}): ${message}`)
    this.name = 'SparkApiError'
    this.method = method
    this.code = code
    this.codeName = sparkCodeName(code)
    this.retryable = RETRYABLE_CODES.has(code)
  }
}

export function maskSparkToken(text: string): string {
  return text.replace(/([?&]token=)[^&\s"']+/gi, '$1***')
}

export interface SparkSimInfo {
  iccid: string
  smdpServer: string
  activationCode: string
  urlQrCode: string
  subscriberId: number
  esimId?: number
  subsPackageId?: number
  userSimName?: string
}

export interface SparkSubscriberRow {
  subscriberId: number
  sim?: {
    status?: string // 'FREE' | 'AFFECTED' | ...
    smdpServer?: string
    activationCode?: string
    [k: string]: unknown
  }
  [k: string]: unknown
}

interface SparkStatus {
  code: number
  msg?: string
  message?: string
}

export function useSparkApi() {
  const endpoint = process.env.SPARK_API_ENDPOINT
  const token = process.env.SPARK_API_TOKEN
  const accountId = Number(process.env.SPARK_ACCOUNT_ID)

  if (!endpoint || !token || !accountId) {
    throw new Error('Spark API configuration is missing (SPARK_API_ENDPOINT/TOKEN/ACCOUNT_ID)')
  }

  async function call<T = Record<string, unknown>>(
    method: string,
    params: Record<string, unknown>,
    opts: { v2?: boolean } = {},
  ): Promise<T> {
    const base = opts.v2 ? endpoint!.replace(/\/v1$/, '/v2') : endpoint!
    const url = `${base}?token=${token}`
    const startedAt = Date.now()

    const fail = (code: number, message: string): never => {
      const err = new SparkApiError(method, code, message)
      logEvent('EXTERNAL_API_ERROR', 'error', err.message, {
        service: 'spark',
        sparkMethod: method,
        sparkCode: err.code,
        sparkCodeName: err.codeName,
        durationMs: Date.now() - startedAt,
      })
      throw err
    }

    let res: Response
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [method]: params }),
        // 벤더 행 (hang) 시 advisory lock 점유 방지
        signal: AbortSignal.timeout(30_000),
      })
    } catch (e) {
      // 네트워크 단 실패 — 벤더 도달 전으로 간주 가능하나 확신 불가하므로 terminal 처리
      return fail(-1, maskSparkToken(String(e)))
    }

    if (!res.ok) {
      return fail(-res.status, `HTTP ${res.status}`)
    }

    const body = (await res.json()) as { status?: SparkStatus } & Record<string, unknown>
    const status = body.status
    if (!status || status.code !== 0) {
      return fail(status?.code ?? -1, status?.msg || status?.message || 'unknown error')
    }

    logEvent('SPARK_API_CALL', 'info', `spark ${method} ok`, {
      sparkMethod: method,
      durationMs: Date.now() - startedAt,
    })
    return (body[method] ?? {}) as T
  }

  /** FREE 재고 조회 — 응답 키가 subscriberList (subscriber 아님) */
  async function listSubscribers(): Promise<{
    subscriberList: SparkSubscriberRow[]
    hasMore?: boolean
    nbFound?: number
  }> {
    return call('listSubscriber', { accountId })
  }

  /**
   * recurring (일일형 U 계열) 패키지 부여 — subscriber 중첩 파라미터.
   * first-use 모드 (john 결정 2026-08-19): activationAtFirstUse=true, 이 모드에선
   * startTimeUTC 전달 금지 (문서 명시). 첫 패키지가 즉시 생성되어 응답에 포함됨
   */
  async function affectRecurringPackage(params: {
    packageTemplateId: number
    subscriberId: number
  }): Promise<{ packageInfo?: Record<string, unknown> | null; simInfo: SparkSimInfo }> {
    return call('affectRecurringPackageToSubscriber', {
      packageTemplateId: params.packageTemplateId,
      subscriber: { subscriberId: params.subscriberId },
      activationAtFirstUse: true,
    })
  }

  /**
   * 비recurring (총량형 L 계열) 패키지 부여 — 응답이 flat simInfo (래핑 없음).
   * first-use 모드: activePeriod/validityPeriod 생략 = start 는 첫 사용 성공 시각,
   * end 는 첫 사용 + 템플릿 validity 일수
   */
  async function affectPackage(params: { packageTemplateId: number }): Promise<SparkSimInfo> {
    return call('affectPackageToSubscriber', {
      packageTemplateId: params.packageTemplateId,
      accountForSubs: accountId,
    })
  }

  /** 가입자 패키지 목록 (v2 — recurring 키는 v2 전용, 빈 경우 생략됨) */
  async function listSubscriberPrepaidPackages(subscriberId: number): Promise<{
    packages?: Record<string, unknown>[]
    recurring?: Record<string, unknown>[]
  }> {
    return call('listSubscriberPrepaidPackages', { subscriberId }, { v2: true })
  }

  /** 단일 가입자 조회 — flat 파라미터 */
  async function getSingleSubscriber(subscriberId: number): Promise<Record<string, unknown>> {
    return call('getSingleSubscriber', { subscriberId, withSimInfo: true })
  }

  return {
    accountId,
    listSubscribers,
    affectRecurringPackage,
    affectPackage,
    listSubscriberPrepaidPackages,
    getSingleSubscriber,
  }
}
