import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'
import { APP_DIR } from './test-data'
import { readSource, scanScript, type SourceParts } from './test-source'

/**
 * spec 불변식 2 · DoD 2 «가격 리터럴 0» — 화면에 나가는 가격은 K1 최종가에서만 나온다.
 * 앱 소스(app · shared · server · modules · nuxt.config)를 토큰으로 읽어(주석 제외 — test-source.ts) 아래를 찾는다.
 *  1. 문자열 · 템플릿 문자열 · 템플릿 글자 속 금액 «4,900원» · «12700 원» · «50원»
 *  2. 가격 함수에 숫자를 넣음 — `formatWon(4900)` · 템플릿 `{{ formatWon(4900) }}`
 *  3. 가격 · 금액 이름에 숫자를 넣음 — `amount: 4900` · `'amount': 4900` · `lowestWon = 900` · `:price="4900"`
 *  4. 숫자 바로 뒤에 «원» — `${4900}원`
 *  5. JSON 의 가격 · 금액 키에 숫자
 * 테스트 · 테스트 도우미 · 카탈로그 데이터 · 자산 매니페스트는 대상이 아니다.
 */
const ROOTS = ['app', 'shared', 'server', 'modules']
const EXTRA = ['nuxt.config.ts']
const EXT = /\.(ts|vue|json)$/
const SKIP = [
  /\.test\.ts$/,
  /^shared\/catalog\/test-(data|source)\.ts$/,
  /^server\/data\//,
  /^app\/content\/catalog-assets\.json$/,
]

const WON = /(?<![\w.,])(?:\d{1,3}(?:,\d{3})+|\d{2,})\s*원/
const PRICE_FN = /^(formatWon|perDayWon|perGbWon)$/
const PRICE_NAME = /(won|price|amount)$/i
const PRICE_ATTR = /(?:^|\s)(?::|v-bind:)[\w-]*(won|price|amount)[\w-]*\s*=\s*["']\s*[\d.]/i

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name)
    return statSync(full).isDirectory() ? files(full) : EXT.test(name) ? [full] : []
  })
}

const unquote = (t: string) => t.replace(/^['"`]|['"`]$/g, '')

function scriptOffenders({ script, template }: SourceParts): string[] {
  const out: string[] = []
  for (const s of script.strings) if (WON.test(s)) out.push(`문자열 «${s.match(WON)![0]}»`)
  for (const n of script.numbers) {
    const [p2, p1] = n.before
    if (p1 === '(' && PRICE_FN.test(p2)) out.push(`${p2}(${n.text})`)
    if ((p1 === ':' || p1 === '=') && PRICE_NAME.test(unquote(p2)))
      out.push(`${p2} ${p1} ${n.text}`)
    if (/^}\s*원/.test(n.after)) out.push(`\${${n.text}}원`)
  }
  if (template) {
    const text = template.match(WON)?.[0]
    if (text) out.push(`템플릿 «${text}»`)
    const fn = template.match(/\b(formatWon|perDayWon|perGbWon)\(\s*[\d.]/)?.[0]
    if (fn) out.push(`템플릿 ${fn}`)
    const attr = template.match(PRICE_ATTR)?.[0]
    if (attr) out.push(`템플릿 ${attr.trim()}`)
  }
  return out
}

function jsonOffenders(v: unknown, at = ''): string[] {
  if (Array.isArray(v)) return v.flatMap((x, i) => jsonOffenders(x, `${at}[${i}]`))
  if (v && typeof v === 'object')
    return Object.entries(v).flatMap(([k, x]) =>
      typeof x === 'number' && PRICE_NAME.test(k)
        ? [`${at}.${k}: ${x}`]
        : jsonOffenders(x, `${at}.${k}`),
    )
  return []
}

function offenders(file: string): string[] {
  if (file.endsWith('.json')) return jsonOffenders(JSON.parse(readFileSync(file, 'utf8')))
  return scriptOffenders(readSource(file))
}

const sources = [
  ...ROOTS.flatMap((r) => files(join(APP_DIR, r))),
  ...EXTRA.map((f) => join(APP_DIR, f)),
]
  .map((f) => relative(APP_DIR, f))
  .filter((f) => !SKIP.some((re) => re.test(f)))

describe('가격 리터럴 0 (spec 불변식 2 · DoD 2)', () => {
  it('대상 파일을 실제로 읽는다(상세 · 홈 · 체크아웃 · 빌드 모듈 · 설정 포함)', () => {
    expect(sources.length).toBeGreaterThan(50)
    for (const f of [
      'app/pages/products/[zone].vue',
      'app/pages/index.vue',
      'app/pages/checkout-preview.vue',
      'app/content/product-detail.ts',
      'shared/utils/robots.ts',
      'modules/catalog.ts',
      'nuxt.config.ts',
    ])
      expect(sources).toContain(f)
  })

  it('앱 소스에 금액 글자 · 가격 함수/이름에 박은 숫자가 없다', () => {
    const found = sources.flatMap((f) => offenders(join(APP_DIR, f)).map((o) => `${f}: ${o}`))
    expect(found).toEqual([])
  })

  describe('검사식이 실제로 잡는다(대조군 — 2회차 리뷰 우회 9종 포함)', () => {
    const vue = (tpl: string, script = '') =>
      scriptOffenders({ script: scanScript(script), template: tpl })
    it.each([
      ['4,900원부터', ''],
      ['', "const a = '12700 원'"],
      ['', "const a = '50원'"],
      ['', 'const x = { amount: 4900 }'],
      ['', "const x = { 'amount': 4900 }"],
      ['', 'let lowestWon = 900'],
      ['', 'const t = { perDayWon: 900, unitPrice: 900 }'],
      ['', 'formatWon(4900)'],
      ['', 'const s = `${4900}원`'],
      ['<PlanCard :price="4900" />', ''],
      ['<PlanCard :final-won="9100" />', ''],
      ['{{ formatWon(4900) }}', ''],
    ])('템플릿 %j · 스크립트 %j', (tpl, script) => {
      expect(vue(tpl, script).length).toBeGreaterThan(0)
    })

    it('문자열 속 `/*` 를 주석으로 읽지 않는다(그 뒤의 금액도 잡는다)', () => {
      expect(vue('', "const a = ['/verify/**']\nconst b = '4,900원'").length).toBe(1)
    })

    it('JSON 의 가격 키', () => {
      expect(jsonOffenders(JSON.parse('{"items":[{"finalWon": 4900}]}'))).toEqual([
        '.items[0].finalWon: 4900',
      ])
    })

    it.each([
      ['', "const a = 'K2 원문'"],
      ['', "const a = '0원 금지'"],
      ['', '// 4,900원 은 주석 — 설명 속 예시는 허용'],
      ['', '/* 9,100원 */ const a = 1'],
      ['', 'const x = { amount: option.finalWon }'],
      ['', 'const s = `${won}원`'],
      ['{{ formatWon(option.finalWon) }}', ''],
      ['<PlanCard :price="formatWon(o.finalWon)" />', ''],
      ['<p>512kbps · 30일</p>', ''],
    ])('허용 — 템플릿 %j · 스크립트 %j', (tpl, script) => {
      expect(vue(tpl, script)).toEqual([])
    })
  })
})
