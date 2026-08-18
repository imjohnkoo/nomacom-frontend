import { eq, sql, and, inArray } from 'drizzle-orm'
import { useDB, schema } from '../db'
import { useSparkApi, SparkApiError, type SparkSimInfo } from './spark-api'
import { mapSparkSimInfo } from './spark-mapping'
import { createUTCDateTime, createLocalDateTime } from './date'
import type { Order } from '../db/schema'

/**
 * Spark 발급 유닛 실행 — backend spark-issuance.service.ts (f9d9c41) 와 동일 규약.
 *
 * 원장 (esim_issuance) 규약:
 *  - 벤더 콜 **전에** REQUESTED INSERT (idempotency_key = '{productOrderId}-{unitIndex}',
 *    live 상태 partial unique → 23505 는 동시 진행 신호로 발급 거부)
 *  - 원장 기록은 락 TX 밖 (pool, 즉시 커밋) — 락 TX 가 굴러도 벤더 성공 기록은 보존
 *  - 벤더 도달 전/거절 → FAILED (재시도 개방), fulfill 실패 → ORPHANED (벤더 성공이므로 FAILED 금지)
 *
 * 동시성 규약 (backend 설계 심사 확정):
 *  - 발급 유닛 전체 (pick → affect → fulfill) 를 공유 PostgreSQL 의
 *    pg_advisory_xact_lock(42001, accountId) 로 직렬화 — backend/client 두 발급
 *    주체가 같은 DB·같은 키를 쓰므로 앱 경계 무관하게 FREE 이중 배정이 차단됨
 *  - FREE 선택은 첫 건이 아니라 후보 순회 + spark_esim 기배정 필터
 */

const LOCK_CLASS = 42001

export interface SparkIssueParams {
  order: Order
  unitIndex: number // 0-base — 기존 발급 수부터 (resume 정합)
  planTypeId: string
  // first-use 모드 (john 결정 2026-08-19): 발급 파라미터에 시각이 들어가지 않음.
  // 아래 날짜/시각 필드는 "고객 신고 여행일" 참고 기록 전용 — 실제 활성 시각의
  // 사실원장은 usage sync 의 cur_ts_activation_utc
  startDate: string // YYYY-MM-DD (사용자 선택일)
  startTimeZone: string
  startCountry: string
  startTime: number // 사용자 선택 시각 (현 UI 는 자정 = 0)
}

interface ResolvedTemplate {
  templateId: number
  isRecurring: boolean
  periodDays: number | null
  dataByte: number | null
  costEur: string | null
}

/** plan-type → spark_plan_type (enabled) → spark_package_template resolve. 매핑 없으면 null (벤더 콜 전 단락) */
export async function resolveSparkTemplate(planTypeId: string): Promise<ResolvedTemplate | null> {
  const db = useDB()
  const mapping = await db.query.sparkPlanTypes.findFirst({
    where: eq(schema.sparkPlanTypes.planTypeId, planTypeId),
  })
  if (!mapping || mapping.enabled !== true) return null

  const template = await db.query.sparkPackageTemplates.findFirst({
    where: eq(
      schema.sparkPackageTemplates.sparkPackageTemplateId,
      mapping.sparkPackageTemplateId,
    ),
  })
  if (!template || template.deleted === true) return null

  return {
    templateId: template.sparkPackageTemplateId,
    isRecurring: template.isRecurring === true,
    periodDays: template.periodDays,
    dataByte: template.dataByte,
    costEur: template.costEur,
  }
}

function maskedRequestPayload(params: SparkIssueParams, templateId: number) {
  // PII (수취인/구매자) 는 원장에 넣지 않음 — 발급 파라미터만
  return {
    productOrderId: params.order.productOrderId,
    planTypeId: params.planTypeId,
    unitIndex: params.unitIndex,
    templateId,
    startDate: params.startDate,
    startTimeZone: params.startTimeZone,
  }
}

export async function issueSparkUnit(params: SparkIssueParams): Promise<void> {
  const db = useDB()
  const spark = useSparkApi()
  const { order, unitIndex } = params
  const idempotencyKey = `${order.productOrderId}-${unitIndex}`

  const template = await resolveSparkTemplate(params.planTypeId)
  if (!template) {
    throw createError({
      statusCode: 409,
      message: `Spark mapping missing or disabled for plan type '${params.planTypeId}'`,
    })
  }

  // 참고 기록용 — 고객 신고 여행일 (선택일 현지 자정, 버퍼 없음). 발급 파라미터 아님
  const reportedStartUTC = createUTCDateTime(
    params.startDate,
    params.startTime,
    params.startTimeZone,
  )
  const method = template.isRecurring
    ? 'affectRecurringPackageToSubscriber'
    : 'affectPackageToSubscriber'

  // ── 원장: 벤더 콜 전 REQUESTED (락 TX 밖 즉시 커밋) ──
  // attempt = 동일 idempotency_key 의 기존 행 수 + 1 (시도 이력 가시화 — backend 동일)
  const priorRows = await db
    .select({ n: sql<number>`count(*)` })
    .from(schema.esimIssuance)
    .where(eq(schema.esimIssuance.idempotencyKey, idempotencyKey))
  const attempt = Number(priorRows[0]?.n ?? 0) + 1

  let issuanceId: number
  try {
    const inserted = await db
      .insert(schema.esimIssuance)
      .values({
        idempotencyKey,
        attempt,
        productOrderId: order.productOrderId,
        planTypeId: params.planTypeId,
        unitIndex,
        provider: 'spark',
        state: 'REQUESTED',
        apiMethod: method,
        requestPayload: maskedRequestPayload(params, template.templateId),
      })
      .returning({ id: schema.esimIssuance.esimIssuanceId })
    issuanceId = inserted[0].id
  } catch (e: unknown) {
    const pgCode = (e as { code?: string })?.code
    if (pgCode === '23505') {
      // live 원장 존재 = 다른 주체 (backend 포함) 가 이 유닛을 발급 중
      throw createError({
        statusCode: 409,
        message: `Issuance already in progress for ${idempotencyKey}`,
      })
    }
    throw e
  }

  const ledger = async (state: string, patch: Record<string, unknown> = {}) => {
    await db
      .update(schema.esimIssuance)
      .set({ state, updatedAt: new Date(), ...patch })
      .where(eq(schema.esimIssuance.esimIssuanceId, issuanceId))
  }

  try {
    // ── 발급 유닛 전체를 advisory xact lock 으로 직렬화 ──
    const fulfilled = await db.transaction(async (tx) => {
      await tx.execute(sql`SET LOCAL lock_timeout = '15s'`)
      await tx.execute(sql`SELECT pg_advisory_xact_lock(${LOCK_CLASS}, ${spark.accountId})`)

      // pick: FREE 후보 순회 + spark_esim 기배정 필터 (첫 건 고정 금지)
      const { subscriberList } = await spark.listSubscribers()
      const freeCandidates = (subscriberList ?? []).filter(
        (s) => String(s.sim?.status ?? '').toUpperCase() === 'FREE',
      )
      if (freeCandidates.length === 0) {
        throw createError({ statusCode: 503, message: 'No FREE Spark subscriber available' })
      }
      const candidateIds = freeCandidates.map((s) => s.subscriberId)
      const taken = await tx
        .select({ subscriberId: schema.sparkEsims.subscriberId })
        .from(schema.sparkEsims)
        .where(inArray(schema.sparkEsims.subscriberId, candidateIds))
      const takenSet = new Set(taken.map((t) => t.subscriberId))
      const pick = freeCandidates.find((s) => !takenSet.has(s.subscriberId))
      if (!pick) {
        throw createError({
          statusCode: 503,
          message: 'All FREE Spark subscribers already assigned locally',
        })
      }

      // affect: 벤더 쓰기 콜 — timeout 이어도 재시도 금지 (이중 부여 위험)
      let simInfo: SparkSimInfo
      let responsePayload: unknown
      let packageInfo: Record<string, unknown> | null = null
      try {
        if (template.isRecurring) {
          // first-use: 첫 패키지 즉시 생성 — packageInfo 가 응답에 포함됨 (null 내성은 유지)
          const res = await spark.affectRecurringPackage({
            packageTemplateId: template.templateId,
            subscriberId: pick.subscriberId,
          })
          simInfo = res.simInfo
          packageInfo = res.packageInfo ?? null
          responsePayload = res
        } else {
          // first-use: activePeriod 생략 — 첫 사용 시각부터 템플릿 validity 일수
          const res = await spark.affectPackage({
            packageTemplateId: template.templateId,
          })
          simInfo = res // flat simInfo (래핑 없음)
          responsePayload = res
        }
      } catch (e) {
        // 벤더 도달 전/거절 → FAILED (재시도 개방)
        const code = e instanceof SparkApiError ? e.code : null
        await ledger('FAILED', {
          statusCode: code,
          errorMessage: String((e as Error).message).slice(0, 500),
        })
        throw e
      }

      // 벤더 성공 — 매핑/검증 전에 먼저 원장 전이 (락 TX 밖 즉시 커밋: 이후
      // 매핑·fulfill 실패가 벤더 성공 기록을 지우지 못하게 — FAILED 금지 규약)
      await ledger('VENDOR_ACCEPTED', {
        vendorRef: simInfo?.subscriberId != null ? String(simInfo.subscriberId) : null,
        responsePayload,
      })
      await ledger('PROFILE_READY', { profilePayload: responsePayload })

      // FULFILLING 원자 클레임 — 반환행 확인
      const claimed = await db
        .update(schema.esimIssuance)
        .set({ state: 'FULFILLING', updatedAt: new Date() })
        .where(
          and(
            eq(schema.esimIssuance.esimIssuanceId, issuanceId),
            eq(schema.esimIssuance.state, 'PROFILE_READY'),
          ),
        )
        .returning({ id: schema.esimIssuance.esimIssuanceId })
      if (claimed.length !== 1) {
        throw new Error(`Fulfill claim failed for issuance ${issuanceId}`)
      }

      try {
        // 매핑·검증 — 벤더 성공 이후이므로 실패 시 ORPHANED (0 센티널 금지: esimId 부재도 throw)
        const mapped = mapSparkSimInfo(simInfo)

        // fulfill 단일 TX: esim PK 시퀀스 채번 → esim + spark_esim + plan + spark_plan
        const seqRows = (await tx.execute(
          sql`SELECT nextval('esim_pk_seq') AS id`,
        )) as unknown as Array<{ id: string | number }>
        const esimPk = Number(seqRows[0].id)

        // tag/state 는 Maya 어휘 컬럼 — Spark행은 NULL (backend 규약: 운영 도구가
        // tag 포맷으로 발급 경로를 판정하므로 userSimName 기입 금지)
        await tx.insert(schema.esims).values({
          esimId: String(esimPk),
          iccid: mapped.iccid,
          smdpAddress: mapped.smdpAddress,
          manualCode: mapped.manualCode,
          activationCode: mapped.activationCode,
          dateAssigned: new Date(),
          provider: 'spark',
          orderId: order.productOrderId,
        })

        await tx.insert(schema.sparkEsims).values({
          esimId: esimPk,
          ocsEsimId: mapped.ocsEsimId,
          subscriberId: mapped.subscriberId,
          iccid: mapped.iccid,
          sparkSmdpServer: mapped.smdpAddress,
          sparkActivationCode: mapped.manualCode,
          sparkUrlQrCode: mapped.activationCode,
          userSimName: simInfo.userSimName ?? null,
        })

        // 잔량/원가 즉시 기입 — packageInfo (recurring, 있을 때만) 우선, 카탈로그 캐시 fallback
        const pckDataByte = Number(packageInfo?.pckdatabyte ?? NaN)
        const dataQuotaBytes = Number.isFinite(pckDataByte) ? pckDataByte : template.dataByte
        const resellerCost = packageInfo?.resellerCost ?? packageInfo?.cost
        const costEur = resellerCost != null ? String(resellerCost) : template.costEur

        const planRows = await tx
          .insert(schema.plans)
          .values({
            esimId: String(esimPk),
            planTypeId: params.planTypeId,
            provider: 'spark',
            isActivated: true,
            startDateEntered: params.startDate,
            startTimeEntered: params.startTime,
            startTimeZoneEntered: params.startTimeZone,
            startCountryEntered: params.startCountry,
            dataQuotaBytes,
            // 참고 기록 (고객 신고 여행일) — first-use 라 실제 활성 시각은 usage sync 가 원장
            timeToBeActivatedInUTC: reportedStartUTC,
            timeToBeActivatedInLocal: createLocalDateTime(
              params.startDate,
              params.startTime,
              params.startTimeZone,
            ),
          })
          .returning({ planId: schema.plans.planId })
        const planId = planRows[0].planId

        await tx.insert(schema.sparkPlans).values({
          planId,
          subscriberId: mapped.subscriberId,
          sparkPackageTemplateId: template.templateId,
          isRecurring: template.isRecurring,
          firstSubsPackageId: simInfo.subsPackageId ?? null,
          startTimeUtc: reportedStartUTC,
          costEur,
        })

        return { esimPk, planId }
      } catch (e) {
        // 벤더 성공 후 fulfill 실패 — FAILED 금지, 수동 종결 대상
        await ledger('ORPHANED', {
          errorMessage: String((e as Error).message).slice(0, 500),
        })
        throw e
      }
    })

    // LINKED 는 fulfill TX 커밋 완료 후에만 기록 — 커밋 전 기록하면 크래시 시
    // "LINKED 인데 row 없음" 원장 신뢰성 역전 (backend markLinked 순서와 동일)
    await ledger('LINKED', { esimId: fulfilled.esimPk, planId: fulfilled.planId })
  } catch (e) {
    // REQUESTED 로 남아 있는 미전이 원장 (락 대기 timeout 등 affect 이전 실패) 정리
    const row = await db.query.esimIssuance.findFirst({
      where: eq(schema.esimIssuance.esimIssuanceId, issuanceId),
    })
    if (row && row.state === 'REQUESTED') {
      await ledger('FAILED', { errorMessage: String((e as Error).message).slice(0, 500) })
    }
    throw e
  }
}
