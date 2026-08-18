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
  startDate: string // YYYY-MM-DD (사용자 선택일)
  startTimeZone: string
  startCountry: string
  startTime: number // 사용자 입력값 (원본 기록용 — Spark 시각 계산에는 미사용)
}

interface ResolvedTemplate {
  templateId: number
  isRecurring: boolean
  periodDays: number | null
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
  }
}

/** 'YYYY-MM-DDTHH:mm:ss' (타임존 표기 없는 UTC — Spark transport 형식) */
function toSparkUTCString(d: Date): string {
  return d.toISOString().slice(0, 19)
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

  // Spark 시각 규약: 사용자 입력 (선택일 현지 자정) −12h
  const startUTC = createUTCDateTime(params.startDate, -12, params.startTimeZone)
  const method = template.isRecurring
    ? 'affectRecurringPackageToSubscriber'
    : 'affectPackageToSubscriber'

  // ── 원장: 벤더 콜 전 REQUESTED (락 TX 밖 즉시 커밋) ──
  let issuanceId: number
  try {
    const inserted = await db
      .insert(schema.esimIssuance)
      .values({
        idempotencyKey,
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
    await db.transaction(async (tx) => {
      await tx.execute(sql`SET LOCAL lock_timeout = '15s'`)
      await tx.execute(sql`SELECT pg_advisory_xact_lock(${LOCK_CLASS}, ${spark.accountId})`)

      // pick: FREE 후보 순회 + spark_esim 기배정 필터 (첫 건 고정 금지)
      const { subscriberList } = await spark.listSubscribers()
      const freeCandidates = (subscriberList ?? []).filter((s) => s.sim?.status === 'FREE')
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
      try {
        if (template.isRecurring) {
          const res = await spark.affectRecurringPackage({
            packageTemplateId: template.templateId,
            subscriberId: pick.subscriberId,
            startTimeUTC: toSparkUTCString(startUTC),
          })
          // start 가 now+12h 밖이면 packageInfo 부재 — null 내성
          simInfo = res.simInfo
          responsePayload = res
        } else {
          const periodDays = template.periodDays ?? 0
          if (periodDays <= 0) {
            throw createError({
              statusCode: 500,
              message: `Spark template ${template.templateId} has no periodDays`,
            })
          }
          const end = new Date(startUTC.getTime() + periodDays * 24 * 3600 * 1000)
          const res = await spark.affectPackage({
            packageTemplateId: template.templateId,
            activePeriod: { start: toSparkUTCString(startUTC), end: toSparkUTCString(end) },
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

      // 벤더 성공 — 원장 전이 (락 TX 밖 즉시 커밋: 이후 실패해도 기록 보존)
      const mapped = mapSparkSimInfo(simInfo)
      await ledger('VENDOR_ACCEPTED', {
        vendorRef: String(mapped.subscriberId),
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
        // fulfill 단일 TX: esim PK 시퀀스 채번 → esim + spark_esim + plan + spark_plan
        const seqRows = (await tx.execute(
          sql`SELECT nextval('esim_pk_seq') AS id`,
        )) as unknown as Array<{ id: string | number }>
        const esimPk = Number(seqRows[0].id)

        await tx.insert(schema.esims).values({
          esimId: String(esimPk),
          iccid: mapped.iccid,
          apn: null,
          tag: simInfo.userSimName ?? null,
          state: 'AFFECTED',
          smdpAddress: mapped.smdpAddress,
          manualCode: mapped.manualCode,
          activationCode: mapped.activationCode,
          dateAssigned: new Date(),
          provider: 'spark',
          orderId: order.productOrderId,
        })

        await tx.insert(schema.sparkEsims).values({
          esimId: esimPk,
          ocsEsimId: simInfo.esimId ?? 0,
          subscriberId: mapped.subscriberId,
          iccid: mapped.iccid,
          sparkSmdpServer: mapped.smdpAddress,
          sparkActivationCode: mapped.manualCode,
          sparkUrlQrCode: mapped.activationCode,
          userSimName: simInfo.userSimName ?? null,
        })

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
            timeToBeActivatedInUTC: startUTC, // 사용자 입력 −12h
            timeToBeActivatedInLocal: createLocalDateTime(
              params.startDate,
              -12,
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
          startTimeUtc: startUTC,
        })

        // LINKED (soft-ref 기록)
        await ledger('LINKED', { esimId: esimPk, planId })
      } catch (e) {
        // 벤더 성공 후 fulfill 실패 — FAILED 금지, 수동 종결 대상
        await ledger('ORPHANED', {
          errorMessage: String((e as Error).message).slice(0, 500),
        })
        throw e
      }
    })
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
