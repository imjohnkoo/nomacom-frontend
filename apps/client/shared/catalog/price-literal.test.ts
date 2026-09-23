import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'
import { APP_DIR } from './test-data'
import {
  parseSource,
  readSource,
  scanScript,
  stringsOf,
  type SourceParts,
  type Token,
} from './test-source'

/**
 * spec 불변식 2 · DoD 2 «가격 리터럴 0» — 화면에 나가는 가격은 K1 최종가에서만 나온다.
 * 앱 소스(app · shared · server · modules · nuxt.config · CSS)를 토큰으로 읽어(주석 제외 — test-source.ts) 찾는다.
 *  1. 금액 글자 — 문자열 · 템플릿 · 스타일(`content:`) · JSON 문자열의 «4,900원» · «50원» · «₩4,900» · «4900 KRW»(전각 숫자 포함)
 *  2. 가격 문맥의 숫자 — 가격 · 금액 이름(`…Won` · `…price(s)` · `…amount`)에 대입 · 속성으로 이어지는 식 안의 10 이상 숫자
 *     (`amount: 4900` · `lowestWon: number = 4900` · `won ||= 900` · `price: f ? 4900 : 9100` · `:price="+4900"` · `price="4900"`)
 *  3. 가격 함수 인자의 숫자 — `formatWon(4900)` · `formatWon(x ?? 4900)`
 *  4. «원» 으로 이어지는 숫자 — `${4900}원` · `4900 + '원'` · `(4900).toLocaleString() + '원'` · `'4,900' + '원'` · `{{ 4900 }}원`
 *  5. JSON 의 가격 키에 숫자
 * 테스트 · 테스트 도우미 · 카탈로그 데이터 · 자산 매니페스트는 대상이 아니다. 0 · 한 자리는 가격으로 보지 않는다(누적 초기값).
 */
const ROOTS = ['app', 'shared', 'server', 'modules']
const EXTRA = ['nuxt.config.ts']
const EXT = /\.(ts|vue|json|css)$/
const SKIP = [
  /\.test\.ts$/,
  /^shared\/catalog\/test-(data|source)\.ts$/,
  /^server\/data\//,
  /^app\/content\/catalog-assets\.json$/,
]

const nfkc = (s: string) => s.normalize('NFKC')
const WON = /₩\s*\d|(?<![\w.,])(?:\d{1,3}(?:,\d{3})+|\d{2,})\s*(?:원|KRW)/i
const wonIn = (s: string) => nfkc(s).match(WON)?.[0]
const PRICE_NAME = /(won|price|amount)s?$/i
const PRICE_FN = /^(formatWon|perDayWon|perGbWon)$/
const ASSIGN = new Set([':', '=', '||=', '??=', '&&=', '+=', '-=', '*='])
const OPEN = new Set(['(', '[', '{'])
const CLOSE = new Set([')', ']', '}'])
const priceNumber = (t: Token | undefined) => t?.kind === 'number' && Number(t.value) >= 10
const startsWithWon = (t: Token | undefined) =>
  t?.kind === 'string' && nfkc(t.value).trimStart().startsWith('원')

/** i 뒤 식 한 덩어리(같은 깊이의 `;` · `,` · 줄바꿈 · 닫는 괄호까지)에 10 이상 숫자가 있나 */
function numberInExpression(tokens: Token[], from: number): Token | undefined {
  let depth = 0
  for (let j = from; j < tokens.length; j++) {
    const t = tokens[j]!
    if (j > from && depth === 0 && (t.newline || t.text === ';' || t.text === ',')) return undefined
    if (OPEN.has(t.text)) depth++
    else if (CLOSE.has(t.text) && --depth < 0) return undefined
    else if (priceNumber(t)) return t
  }
  return undefined
}

export function scriptOffenders(tokens: Token[]): string[] {
  const out: string[] = []
  tokens.forEach((t, i) => {
    if (t.kind === 'string') {
      const w = wonIn(t.value)
      if (w) out.push(`문자열 «${w}»`)
      // '4,900' + '원'
      if (
        /^\s*\d[\d,]*\s*$/.test(nfkc(t.value)) &&
        tokens[i + 1]?.text === '+' &&
        startsWithWon(tokens[i + 2])
      )
        out.push(`'${t.value}' + '원'`)
    }
    const name = t.kind === 'ident' ? t.text : t.kind === 'string' ? t.value : ''
    if (name && PRICE_NAME.test(name) && ASSIGN.has(tokens[i + 1]?.text ?? '')) {
      const n = numberInExpression(tokens, i + 2)
      if (n) out.push(`${name} ${tokens[i + 1]!.text} … ${n.text}`)
    }
    if (t.kind === 'ident' && PRICE_FN.test(t.text) && tokens[i + 1]?.text === '(') {
      const n = numberInExpression(tokens, i + 2)
      if (n) out.push(`${t.text}(… ${n.text} …)`)
    }
    if (priceNumber(t)) {
      // 같은 문장 안에서 숫자 뒤에 «원» 이 붙는 두 모양 — 템플릿 이어짐(`${4900}원`) · `+ '원'`.
      // 그 사이의 함수 인자 문자열(`toLocaleString('ko-KR')`)은 건너뛴다
      for (let k = 1; k <= 12; k++) {
        const u = tokens[i + k]
        if (!u || u.text === ';' || u.newline) break
        const joins =
          u.kind === 'string' && (u.text.startsWith('}') || tokens[i + k - 1]?.text === '+')
        if (joins) {
          if (startsWithWon(u)) out.push(`${t.text} … «원»`)
          break
        }
      }
    }
  })
  return out
}

const INTERP = /\{\{([\s\S]*?)\}\}/g
const BOUND = /(?:^|\s)(?::|v-bind:|v-bind(?=\s*=))([\w.-]*)\s*=\s*"([^"]*)"/g
const STATIC_PRICE_ATTR = /(?:^|\s)(?![:@#])([\w-]*(?:won|price|amount)[\w-]*)\s*=\s*["']\s*[\d₩]/i

export function templateOffenders(template: string): string[] {
  const out: string[] = []
  const w = wonIn(template)
  if (w) out.push(`템플릿 «${w}»`)
  for (const m of template.matchAll(INTERP)) {
    const tokens = scanScript(m[1]!)
    out.push(...scriptOffenders(tokens).map((o) => `{{ }} ${o}`))
    // {{ 4900 }}원 · {{ '4,900' }}원
    const after = template.slice(m.index! + m[0].length)
    const literal = tokens.some(
      (t) => priceNumber(t) || (t.kind === 'string' && /\d{2,}/.test(t.value)),
    )
    if (/^\s*원/.test(after) && literal) out.push(`{{ ${m[1]!.trim()} }}원`)
  }
  for (const m of template.matchAll(BOUND)) {
    const tokens = scanScript(m[2]!)
    out.push(...scriptOffenders(tokens).map((o) => `:${m[1]} ${o}`))
    if (PRICE_NAME.test(m[1]!.replace(/-/g, '')) && tokens.some(priceNumber))
      out.push(`:${m[1]}="${m[2]}"`)
  }
  const attr = template.match(STATIC_PRICE_ATTR)?.[0]
  if (attr) out.push(`속성 ${attr.trim()}`)
  return out
}

export function jsonOffenders(v: unknown, at = ''): string[] {
  if (typeof v === 'string') {
    const w = wonIn(v)
    return w ? [`${at}: «${w}»`] : []
  }
  if (Array.isArray(v)) return v.flatMap((x, i) => jsonOffenders(x, `${at}[${i}]`))
  if (v && typeof v === 'object')
    return Object.entries(v).flatMap(([k, x]) =>
      typeof x === 'number' && PRICE_NAME.test(k) && x >= 10
        ? [`${at}.${k}: ${x}`]
        : jsonOffenders(x, `${at}.${k}`),
    )
  return []
}

function partsOffenders({ script, template, style }: SourceParts): string[] {
  const out = [...scriptOffenders(script), ...templateOffenders(template)]
  const w = wonIn(style)
  if (w) out.push(`스타일 «${w}»`)
  return out
}

function offenders(file: string): string[] {
  if (file.endsWith('.json')) return jsonOffenders(JSON.parse(readFileSync(file, 'utf8')))
  return partsOffenders(readSource(file))
}

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name)
    return statSync(full).isDirectory() ? files(full) : EXT.test(name) ? [full] : []
  })
}

const sources = [
  ...ROOTS.flatMap((r) => files(join(APP_DIR, r))),
  ...EXTRA.map((f) => join(APP_DIR, f)),
]
  .map((f) => relative(APP_DIR, f))
  .filter((f) => !SKIP.some((re) => re.test(f)))

describe('가격 리터럴 0 (spec 불변식 2 · DoD 2)', () => {
  it('대상 파일을 실제로 읽는다(상세 · 홈 · 체크아웃 · 빌드 모듈 · 설정 · CSS 포함)', () => {
    expect(sources.length).toBeGreaterThan(50)
    for (const f of [
      'app/pages/products/[zone].vue',
      'app/pages/index.vue',
      'app/pages/checkout-preview.vue',
      'app/content/product-detail.ts',
      'app/content/catalog-upcoming.json',
      'app/assets/css/main.css',
      'shared/utils/robots.ts',
      'modules/catalog.ts',
      'nuxt.config.ts',
    ])
      expect(sources).toContain(f)
  })

  it('읽는 길이 실제로 내용을 꺼낸다(.ts 문자열 · .vue 템플릿 · <script setup> · <style>)', () => {
    const at = (f: string) => readSource(join(APP_DIR, f))
    expect(stringsOf(at('app/content/product-detail.ts').script)).toContain(
      '사용일수는 이렇게 계산해요',
    )
    const zone = at('app/pages/products/[zone].vue')
    expect(zone.template).toContain('구매하기')
    expect(stringsOf(zone.script)).toContain('Catalog zone unavailable')
    expect(at('app/components/catalog/ZoneMap.vue').style).toContain('.zone-map')
    expect(at('app/assets/css/main.css').style.length).toBeGreaterThan(0)
  })

  it('앱 소스에 금액 글자 · 가격 문맥의 숫자가 없다', () => {
    const found = sources.flatMap((f) => offenders(join(APP_DIR, f)).map((o) => `${f}: ${o}`))
    expect(found).toEqual([])
  })

  describe('검사식이 실제로 잡는다(대조군)', () => {
    it.each([
      "const a = '12700 원'",
      "const a = '50원'",
      "const a = '₩4,900'",
      "const a = '4900 KRW'",
      "const a = '４,９００원'",
      'const x = { amount: 4900 }',
      "const x = { 'amount': 4900 }",
      'let lowestWon = 900',
      'const b01Won: number = 4900',
      'b09Won ||= 4900',
      'totalWon += 900',
      'const t = { perDayWon: 900, unitPrice: 900 }',
      'const t = { lowestWon: flag ? 4900 : 9100 }',
      'const prices = [4900, 9100]',
      'formatWon(4900)',
      'formatWon((4900))',
      'formatWon(x ?? 4900)',
      'const s = `${4900}원`',
      "const s = 4900 + '원'",
      "const s = '4,900' + '원'",
      "const s = `${(4900).toLocaleString('ko-KR')}원`",
      // 한 줄에 정규식 속 따옴표 — 정규식으로 다시 읽지 않으면 뒤 문자열의 짝이 어긋나 금액을 놓친다
      "const r = /'/; const a = '4,900원'",
    ])('스크립트 %j', (code) => {
      expect(scriptOffenders(scanScript(code)).length).toBeGreaterThan(0)
    })

    it.each([
      '<p>4,900원부터</p>',
      '<p>{{ 4900 }}원</p>',
      "<p>{{ '4,900' }}원</p>",
      '<p>{{ (4900).toLocaleString() }}원</p>',
      '<p>{{ formatWon(4900) }}</p>',
      '<PlanCard :price="4900" />',
      '<PlanCard :price="+4900" />',
      '<PlanCard :final-won="9100" />',
      '<PlanCard v-bind="{ price: 4900 }" />',
      '<PlanCard price="4900" />',
      '<p>₩4,900</p>',
    ])('템플릿 %j', (tpl) => {
      expect(templateOffenders(tpl).length).toBeGreaterThan(0)
    })

    it('SFC 전체 길 — 템플릿 · <script setup> · 일반 <script> · <style> 을 각각 본다', () => {
      const sfc = (body: string) => partsOffenders(parseSource('x.vue', body))
      expect(sfc('<template><p>4,900원</p></template>')).toHaveLength(1)
      expect(
        sfc('<template><p/></template><script setup lang="ts">const a = { amount: 4900 }</script>'),
      ).toHaveLength(1)
      expect(
        sfc('<template><p/></template><script lang="ts">export const a = "9,100원"</script>'),
      ).toHaveLength(1)
      expect(
        sfc('<template><p/></template><style>.a::after { content: "9,100원" }</style>'),
      ).toHaveLength(1)
      expect(partsOffenders(parseSource('x.css', '.a::after { content: "4,900원" }'))).toHaveLength(
        1,
      )
    })

    it('JSON — 가격 키의 숫자 · 문자열 속 금액', () => {
      expect(jsonOffenders(JSON.parse('{"items":[{"finalWon": 4900}]}'))).toEqual([
        '.items[0].finalWon: 4900',
      ])
      expect(jsonOffenders(JSON.parse('{"note":"일본은 곧 4,900원부터"}'))).toEqual([
        '.note: «4,900원»',
      ])
    })

    it.each([
      "const a = 'K2 원문'",
      "const a = '0원 금지'",
      '// 4,900원 은 주석 — 설명 속 예시는 허용',
      '/* 9,100원 */ const a = 1',
      'const x = { amount: option.finalWon }',
      'let totalWon = 0',
      'const s = `${won}원`',
      "const a = ['/verify/**']",
      'const t = { width: 400, status: 404 }',
      'formatWon(option.finalWon)',
    ])('허용 — 스크립트 %j', (code) => {
      expect(scriptOffenders(scanScript(code))).toEqual([])
    })

    it.each([
      '{{ formatWon(option.finalWon) }}',
      '<PlanCard :price="formatWon(o.finalWon)" />',
      '<p>512kbps · 30일</p>',
      '<p>{{ won }}원</p>',
      '<img width="400" height="400" />',
      '<PlanCard :price="0" />',
    ])('허용 — 템플릿 %j', (tpl) => {
      expect(templateOffenders(tpl)).toEqual([])
    })
  })
})
