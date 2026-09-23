/**
 * 국가 검색 별칭 — spec D-9. 공식 한글 이름(K1)과 다르게 부르는 이름만 둔다. 영문 이름은 자동(Intl.DisplayNames).
 * 키 = ISO3. 준비 중 나라 목록은 `catalog-upcoming.json`.
 */
export const COUNTRY_ALIASES: Record<string, string[]> = {
  TUR: ['터키', 'turkey'],
  CZE: ['체코공화국', 'czech republic'],
  GBR: ['잉글랜드', '스코틀랜드', 'uk', 'england'],
  USA: ['미합중국', 'usa', 'america'],
  NLD: ['홀란드', 'holland'],
  CYP: ['사이프러스'],
  MKD: ['마케도니아'],
  GEO: ['그루지야'],
  BIH: ['보스니아 헤르체고비나', 'bosnia'],
  CHE: ['swiss'],
}
