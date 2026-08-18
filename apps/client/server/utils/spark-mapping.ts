import type { SparkSimInfo } from './spark-api';

/**
 * Spark simInfo → 우리 esim 중립 컬럼 매핑.
 *
 * ⚠ QR 이름충돌 주의 (backend spark-mapping.ts 와 동일 규칙 필수):
 *  - 우리 esim."activationCode" = Spark **urlQrCode** (LPA:1$... 풀스트링)
 *  - 우리 esim."manualCode"     = Spark activationCode (순수 코드, LPA 프리픽스 없음)
 *  - 우리 esim."smdpAddress"    = Spark smdpServer
 *
 * spark_esim 테이블에 CHECK 제약 존재 (url_qr_code LIKE 'LPA:1$%',
 * activation_code NOT LIKE 'LPA:%') — 여기서 선검증해 벤더 응답 이상을
 * DB 제약 위반 전에 잡는다.
 */

export interface NeutralEsimFields {
  iccid: string;
  activationCode: string; // LPA 풀스트링 (view QR 렌더가 그대로 사용)
  manualCode: string; // 순수 활성화 코드
  smdpAddress: string;
  subscriberId: number;
  ocsEsimId: number; // Spark 응답 esimId — 0 센티널 금지 (부재 시 throw → ORPHANED)
}

export function mapSparkSimInfo(simInfo: SparkSimInfo): NeutralEsimFields {
  const { iccid, urlQrCode, activationCode, smdpServer, subscriberId, esimId } = simInfo;

  if (!iccid || !urlQrCode || !activationCode || !smdpServer || !subscriberId || !esimId) {
    throw new Error(
      `Spark simInfo incomplete: ${JSON.stringify({
        iccid: !!iccid,
        urlQrCode: !!urlQrCode,
        activationCode: !!activationCode,
        smdpServer: !!smdpServer,
        subscriberId: !!subscriberId,
        esimId: !!esimId,
      })}`,
    );
  }

  if (!urlQrCode.startsWith('LPA:1$')) {
    throw new Error(`Spark urlQrCode is not an LPA string: ${urlQrCode.slice(0, 12)}...`);
  }
  if (activationCode.startsWith('LPA:')) {
    throw new Error('Spark activationCode unexpectedly contains LPA prefix — mapping mismatch');
  }

  return {
    iccid,
    activationCode: urlQrCode,
    manualCode: activationCode,
    smdpAddress: smdpServer,
    subscriberId,
    ocsEsimId: esimId,
  };
}
