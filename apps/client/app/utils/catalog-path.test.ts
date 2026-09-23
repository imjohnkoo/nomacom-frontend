import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { readSource } from '#shared/catalog/test-source'
import { catalogPageError, isCatalogParam, lowercaseRedirect } from './catalog-path'

describe('lowercaseRedirect (catalog spec D-13)', () => {
  it.each([
    ['/countries/FRA', '/countries/fra'],
    ['/countries/Fra', '/countries/fra'],
    ['/countries/FRA/', '/countries/fra'],
    ['/products/EU340', '/products/eu340'],
    ['/products/Cze00', '/products/cze00'],
  ])('%s → 301 %s', (path, target) => {
    expect(lowercaseRedirect(path)).toBe(target)
  })

  it.each([
    '/countries/fra',
    '/products/cze00',
    '/',
    '/search',
    '/verify/1',
    '/countries',
    '/products/cze00/x',
  ])('%s → 그대로', (path) => {
    expect(lowercaseRedirect(path)).toBeNull()
  })
})

describe('isCatalogParam', () => {
  it('나라 = 소문자 3자 · zone = 소문자 · 숫자 5자', () => {
    expect(isCatalogParam('countries', 'fra')).toBe(true)
    expect(isCatalogParam('products', 'cze00')).toBe(true)
    expect(isCatalogParam('products', 'eu340')).toBe(true)
  })

  it.each([
    ['countries', 'fr'],
    ['countries', 'fra1'],
    ['countries', 'FRA'],
    ['countries', '../x'],
    ['products', 'cze0'],
    ['products', 'cze000'],
    ['products', 'CZE00'],
    ['products', 'cze-0'],
  ] as const)('%s/%s → 404', (section, param) => {
    expect(isCatalogParam(section, param)).toBe(false)
  })
})

describe('catalogPageError (spec F-10 — 404 가 아닌 오류는 500)', () => {
  it.each([
    [{ statusCode: 404 }, false, 404],
    [null, false, 404],
    [undefined, false, 404],
    [{ statusCode: 500 }, false, 500],
    [{ statusCode: 502 }, false, 500],
    [{}, false, 500],
    [{ statusCode: 500 }, true, 500],
    [null, true, null],
  ] as const)('error %j · data %s → %s', (error, hasData, want) => {
    expect(catalogPageError(error, hasData)).toBe(want)
  })
})

describe('국가 · 상품 페이지가 catalogPageError 로 던진다(F-10 결선)', () => {
  const APP = fileURLToPath(new URL('../../', import.meta.url))
  it.each(['app/pages/products/[zone].vue', 'app/pages/countries/[iso3].vue'])('%s', (file) => {
    const t = readSource(`${APP}${file}`).script.map((x) => x.text)
    const at = t.findIndex((x, i) => x === 'catalogPageError' && t[i + 1] === '(')
    expect(at, '호출이 없다').toBeGreaterThan(-1)
    expect(t.slice(at, at + 4)).toEqual(['catalogPageError', '(', 'error', '.'])
    // 판정 뒤 처음 던지는 상태는 판정 결과(failed) — 404 · 500 을 따로 박지 않는다
    // (앞쪽의 404 는 URL 모양 검사 isCatalogParam 몫이라 제외)
    const after = t.slice(at)
    const sc = after.indexOf('statusCode')
    expect(after.slice(sc, sc + 3)).toEqual(['statusCode', ':', 'failed'])
  })
})
