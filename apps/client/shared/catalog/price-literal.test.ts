import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'
import { APP_DIR } from './test-data'

/**
 * spec 불변식 2 · DoD 2 «가격 리터럴 0» — 화면에 나가는 가격은 K1 최종가에서만 나온다.
 * 앱 소스(app · shared · server)에 «4,900원» 같은 금액 글자나 금액 필드에 숫자를 박은 대입이 있으면 실패한다.
 * 주석은 걷어 내고 본다(설명 속 예시는 허용). 테스트 · 카탈로그 데이터 · 자산 매니페스트는 대상이 아니다.
 */
const ROOTS = ['app', 'shared', 'server']
const EXT = /\.(ts|vue|json)$/
const SKIP = [
  /\.test\.ts$/,
  /^shared\/catalog\/test-data\.ts$/,
  /^server\/data\//,
  /^app\/content\/catalog-assets\.json$/,
]

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name)
    return statSync(full).isDirectory() ? files(full) : EXT.test(name) ? [full] : []
  })
}

const stripComments = (src: string) =>
  src
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:'"`\\])\/\/.*$/gm, '$1')

/** 금액 글자 — «4,900원» · «12700 원» · «900원부터». «K2 원문» · «0원» 같은 한 자리는 가격이 아니다 */
const WON_LITERAL = /(?<![\w.,])(?:\d{1,3}(?:,\d{3})+|\d{3,})\s*원/
/** 금액 필드에 숫자 대입 — `amount: 4900` · `finalWon = 900` */
const AMOUNT_LITERAL = /\b(?:amount|finalWon|priceWon|salePriceWon|won|price)\s*[:=]\s*\d/i

const sources = ROOTS.flatMap((r) => files(join(APP_DIR, r)))
  .map((f) => relative(APP_DIR, f))
  .filter((f) => !SKIP.some((re) => re.test(f)))

describe('가격 리터럴 0 (spec 불변식 2 · DoD 2)', () => {
  it('대상 파일을 실제로 읽는다(상세 · 홈 · 체크아웃 포함)', () => {
    expect(sources.length).toBeGreaterThan(50)
    for (const f of [
      'app/pages/products/[zone].vue',
      'app/pages/index.vue',
      'app/pages/checkout-preview.vue',
      'app/content/product-detail.ts',
      'app/utils/checkout-preview.ts',
    ])
      expect(sources).toContain(f)
  })

  it('앱 소스에 금액 글자 · 금액 숫자 대입이 없다', () => {
    const offenders = sources.flatMap((f) => {
      const src = stripComments(readFileSync(join(APP_DIR, f), 'utf8'))
      const hit = src.match(WON_LITERAL)?.[0] ?? src.match(AMOUNT_LITERAL)?.[0]
      return hit ? [`${f}: «${hit}»`] : []
    })
    expect(offenders).toEqual([])
  })

  it('검사식이 실제로 잡는다(대조군)', () => {
    for (const bad of ['4,900원부터', '12700 원', 'amount: 4900', 'finalWon = 900'])
      expect(WON_LITERAL.test(bad) || AMOUNT_LITERAL.test(bad), bad).toBe(true)
    for (const ok of ['K2 원문', '0원 금지', '512kbps', 'amount: option.finalWon', '{{ won }}원'])
      expect(WON_LITERAL.test(ok) || AMOUNT_LITERAL.test(ok), ok).toBe(false)
    expect(stripComments('a // 4,900원\n/* 9,100원 */ b')).not.toMatch(WON_LITERAL)
  })
})
