import { describe, it, expect } from 'vitest';
import { mapSparkSimInfo } from './spark-mapping';
import { maskSparkToken } from './spark-api';

const validSimInfo = {
  iccid: '8944478600000123456',
  smdpServer: 'consumer.e-sim.global',
  activationCode: 'K2-ABCDEF-GHIJKL',
  urlQrCode: 'LPA:1$consumer.e-sim.global$K2-ABCDEF-GHIJKL',
  subscriberId: 35759705,
};

describe('mapSparkSimInfo (QR 이름충돌 매핑)', () => {
  it('우리 activationCode ← Spark urlQrCode (LPA 풀스트링)', () => {
    const m = mapSparkSimInfo(validSimInfo);
    expect(m.activationCode).toBe('LPA:1$consumer.e-sim.global$K2-ABCDEF-GHIJKL');
  });

  it('우리 manualCode ← Spark activationCode (순수 코드)', () => {
    const m = mapSparkSimInfo(validSimInfo);
    expect(m.manualCode).toBe('K2-ABCDEF-GHIJKL');
  });

  it('우리 smdpAddress ← Spark smdpServer', () => {
    const m = mapSparkSimInfo(validSimInfo);
    expect(m.smdpAddress).toBe('consumer.e-sim.global');
  });

  it('urlQrCode 가 LPA:1$ 로 시작하지 않으면 거부', () => {
    expect(() =>
      mapSparkSimInfo({ ...validSimInfo, urlQrCode: 'K2-ABCDEF-GHIJKL' }),
    ).toThrow(/LPA/);
  });

  it('Spark activationCode 에 LPA 프리픽스가 있으면 매핑 뒤집힘으로 판단하고 거부', () => {
    expect(() =>
      mapSparkSimInfo({
        ...validSimInfo,
        activationCode: 'LPA:1$consumer.e-sim.global$K2-ABCDEF-GHIJKL',
      }),
    ).toThrow(/mapping mismatch/);
  });

  it('필수 필드 누락 시 거부 (fail-closed)', () => {
    expect(() => mapSparkSimInfo({ ...validSimInfo, iccid: '' })).toThrow(/incomplete/);
    expect(() =>
      mapSparkSimInfo({ ...validSimInfo, subscriberId: 0 as never }),
    ).toThrow(/incomplete/);
  });
});

describe('maskSparkToken', () => {
  it('URL 쿼리의 token 값을 마스킹한다', () => {
    expect(maskSparkToken('https://x/v1?token=SECRET123&x=1')).toBe('https://x/v1?token=***&x=1');
    expect(maskSparkToken('POST https://x/v1?a=1&token=SECRET')).toBe(
      'POST https://x/v1?a=1&token=***',
    );
  });

  it('token 이 없으면 원문 유지', () => {
    expect(maskSparkToken('https://x/v1?a=1')).toBe('https://x/v1?a=1');
  });
});
