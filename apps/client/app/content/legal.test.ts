import { describe, expect, it } from 'vitest'
import { LEGAL_DOCUMENTS, PRIVACY, REFUND, TERMS, documentText } from './legal'

describe('환불정책 (A5)', () => {
  const text = documentText(REFUND)

  it('발급 전 전액 환불 문구가 있다', () => {
    expect(text).toContain('eSIM 을 발급받기 전에는 단순 변심이라도 100% 환불이 가능합니다.')
  })

  it.each(['3,500', '3500', '수수료', '공제', '차감', '반품', '청약철회'])(
    '«QR 발급 후» 조항 표현 %s 가 없다',
    (word) => {
      expect(text).not.toContain(word)
    },
  )

  it('처리 기한은 라이브 스토어 고시와 같은 3영업일', () => {
    expect(text).toContain('3영업일 이내')
  })
})

describe('개인정보처리방침 뼈대', () => {
  it('법정 목차 11절', () => {
    expect(PRIVACY.sections.map((s) => s.heading)).toEqual([
      '1. 개인정보의 처리 목적',
      '2. 처리하는 개인정보의 항목',
      '3. 개인정보의 처리 및 보유 기간',
      '4. 개인정보의 제3자 제공',
      '5. 개인정보 처리의 위탁',
      '6. 개인정보의 국외 이전',
      '7. 개인정보의 파기 절차 및 방법',
      '8. 정보주체와 법정대리인의 권리 · 의무 및 행사 방법',
      '9. 개인정보의 안전성 확보 조치',
      '10. 개인정보 보호책임자',
      '11. 개인정보처리방침의 변경',
    ])
  })
})

describe('법정 문서 공통', () => {
  it('세 문서 — 이용약관 · 개인정보처리방침 · 환불정책', () => {
    expect(LEGAL_DOCUMENTS.map((doc) => doc.title)).toEqual([
      '이용약관',
      '개인정보처리방침',
      '환불정책',
    ])
  })

  it('절 key 는 문서 안에서 겹치지 않는다 (앵커 · v-for key)', () => {
    for (const doc of LEGAL_DOCUMENTS) {
      const keys = doc.sections.map((s) => s.key)
      expect(new Set(keys).size).toBe(keys.length)
    }
  })

  it('모든 절에 문단이 하나 이상', () => {
    for (const doc of [TERMS, PRIVACY, REFUND]) {
      for (const section of doc.sections) expect(section.paragraphs.length).toBeGreaterThan(0)
    }
  })
})
