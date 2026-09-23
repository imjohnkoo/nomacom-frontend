import { describe, expect, it } from 'vitest'
import { isCatalogParam, lowercaseRedirect } from './catalog-path'

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
