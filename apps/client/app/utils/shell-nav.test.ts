import { describe, expect, it } from 'vitest'
import { LEGAL_LINKS, SHELL_MENU, SHELL_TABS, activeTabOf } from './shell-nav'

describe('activeTabOf', () => {
  it.each([
    ['/', 'home'],
    ['/search', 'home'],
    ['/my-esim', 'my-esim'],
    ['/guide', 'guide'],
    ['/guide/devices', 'guide'],
    ['/supported-devices', 'guide'],
    ['/my', 'my'],
    ['/my/', 'my'],
    ['/terms', 'my'],
    ['/privacy', 'my'],
    ['/refund', 'my'],
    ['/business', 'my'],
    ['/my#cs', 'my'],
  ])('%s → %s', (path, tab) => {
    expect(activeTabOf(path)).toBe(tab)
  })

  it.each([
    '/verify/1',
    '/details/1',
    '/select-date/1',
    '/view/1',
    '/checkout-preview',
    '/myanmar',
    '/guidex',
  ])('%s → 활성 없음', (path) => {
    expect(activeTabOf(path)).toBeNull()
  })
})

describe('shell 목록', () => {
  it('하단 탭은 홈 · 내 eSIM · 가이드 · 마이 순서 4개 (D4)', () => {
    expect(SHELL_TABS.map((tab) => tab.label)).toEqual(['홈', '내 eSIM', '가이드', '마이'])
  })

  it('각 탭의 목적지는 그 탭을 활성으로 만든다', () => {
    for (const tab of SHELL_TABS) {
      expect(activeTabOf(tab.to)).toBe(tab.key)
    }
  })

  it('약관 및 정책 4종이 전체 메뉴에 그대로 들어 있다', () => {
    const legal = SHELL_MENU.find((group) => group.title === '약관 및 정책')
    expect(legal?.links).toEqual(LEGAL_LINKS)
    expect(LEGAL_LINKS.map((link) => link.to)).toEqual([
      '/terms',
      '/privacy',
      '/refund',
      '/business',
    ])
  })

  it('전체 메뉴는 체크아웃 미리보기를 가리키지 않는다 (K9 — 링크 0)', () => {
    const targets = SHELL_MENU.flatMap((group) => group.links.map((link) => link.to))
    expect(targets.some((to) => to.includes('checkout-preview'))).toBe(false)
  })
})
