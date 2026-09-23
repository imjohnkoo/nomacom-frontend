import { describe, expect, it } from 'vitest'
import { LEGAL_DOCUMENTS, PRIVACY, REFUND, TERMS, documentText, isFullyPending } from './legal'
import { P9_4_PENDING, isPending } from './pending'

// `/refund` 허용 목록 — 문단 · 절 제목은 이 목록과 글자 그대로 같을 때만 통과(바꿔 쓴 «발급 뒤» 문장도 막힌다).
// ① · ③ 은 spec S-4 확정 문구, ② 안내 문장과 절 제목은 이 문서가 정한 것(P9-4 에서 John 확인 대상).
// 바꾸려면 spec 을 먼저 고치고 이 목록을 따라 고친다.
const REFUND_HEADINGS = ['eSIM 발급 전', '신청 방법', '처리 기한']
const REFUND_APPROVED = [
  'eSIM 을 발급받기 전에는 단순 변심이라도 100% 환불이 가능합니다.',
  '주문번호와 함께 아래 고객센터로 요청해 주세요.',
  '환불은 결제하신 수단으로 처리되며, 환불 사유를 확인한 날부터 3영업일 이내에 조치합니다.',
]

describe('환불정책 (A5)', () => {
  const text = documentText(REFUND)

  it('모든 문단이 확정 문구(허용 목록) 또는 대기', () => {
    for (const paragraph of REFUND.sections.flatMap((s) => s.paragraphs)) {
      expect(isPending(paragraph) || REFUND_APPROVED.includes(paragraph)).toBe(true)
    }
  })

  it('절 제목도 허용 목록 — «개통 후» 같은 절을 덧붙여 비껴가지 않게', () => {
    expect(REFUND.sections.map((s) => s.heading)).toEqual(REFUND_HEADINGS)
  })

  it('발급 전 전액 환불 문구가 있다', () => {
    expect(text).toContain('eSIM 을 발급받기 전에는 단순 변심이라도 100% 환불이 가능합니다.')
  })

  it.each(['3,500', '3500', '수수료', '공제', '차감', '반품', '청약철회'])(
    '«QR 발급 후» 조항 표현 %s 가 없다',
    (word) => {
      expect(text).not.toContain(word)
    },
  )

  // A5 — «발급 전 전액 환불» 만 게시한다. 발급 «뒤» 를 다루는 문장은 어떤 표현이든 금지
  // (4-step 확인창의 «발급 후에는 취소와 환불이 불가해요» 같은 문장이 복사돼 들어오는 것을 막는다)
  it.each([
    /발급\s*(후|뒤|이후|한\s*뒤|한\s*후)/,
    /등록\s*(후|뒤|이후|한\s*뒤|한\s*후)/,
    /설치\s*(후|뒤|이후|한\s*뒤|한\s*후)/,
    /불가/,
    /제한/,
  ])('발급 뒤를 다루는 표현 %s 가 없다', (pattern) => {
    expect(text).not.toMatch(pattern)
  })

  it('신청 방법 절(key how)이 있다 — /refund 가 이 절 아래 고객센터 채널을 붙인다', () => {
    expect(REFUND.sections.some((section) => section.key === 'how')).toBe(true)
  })

  it('처리 기한은 라이브 스토어 고시와 같은 3영업일', () => {
    expect(text).toContain('3영업일 이내')
  })
})

describe('개인정보처리방침 뼈대', () => {
  it('법정 목차 12절 (제30조 — 자동 수집 장치 포함)', () => {
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
      '10. 개인정보 자동 수집 장치(쿠키)의 설치 · 운영 및 거부',
      '11. 개인정보 보호책임자',
      '12. 개인정보처리방침의 변경',
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

  it('시행일은 확정 전이거나 YYYY-MM-DD', () => {
    for (const doc of LEGAL_DOCUMENTS) {
      expect(isPending(doc.effectiveDate) || /^\d{4}-\d{2}-\d{2}$/.test(doc.effectiveDate)).toBe(
        true,
      )
    }
  })

  it('문서마다 절이 하나 이상 · 모든 절에 문단이 하나 이상 (빈 문서로 머지 게이트를 비껴가지 않게)', () => {
    for (const doc of [TERMS, PRIVACY, REFUND]) {
      expect(doc.sections.length).toBeGreaterThan(0)
      for (const section of doc.sections) expect(section.paragraphs.length).toBeGreaterThan(0)
    }
  })
})

describe('isFullyPending', () => {
  // 픽스처 기반 — P9-4 문안이 들어와도 깨지지 않는다
  const doc = (paragraphs: string[][]) => ({
    ...TERMS,
    sections: paragraphs.map((p, i) => ({ key: `s${i}`, heading: `S${i}`, paragraphs: p })),
  })

  it('모든 문단이 대기면 true — 문서 전체를 한 줄 안내로 (spec S-4)', () => {
    expect(isFullyPending(doc([[P9_4_PENDING], [P9_4_PENDING, P9_4_PENDING]]))).toBe(true)
  })

  it('확정 문단이 하나라도 있으면 false', () => {
    expect(isFullyPending(doc([[P9_4_PENDING, '확정']]))).toBe(false)
    expect(isFullyPending(doc([[P9_4_PENDING], ['확정']]))).toBe(false)
  })

  it('절 · 문단이 0 이면 false — 빈 문서를 대기로 가리지 않는다', () => {
    expect(isFullyPending(doc([]))).toBe(false)
    expect(isFullyPending(doc([[]]))).toBe(false)
  })

  it('확정 문구가 있는 환불정책은 대기 한 줄이 아니다', () => {
    expect(isFullyPending(REFUND)).toBe(false)
  })
})
