import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { zoneByCode } from './derive'
import {
  initialSelection,
  periodOptions,
  planCards,
  selectedOption,
  selectionLabel,
  withCap,
  withDays,
  withKind,
} from './picker'
import { parseCatalog } from './validate'

const catalog = parseCatalog(
  JSON.parse(
    readFileSync(new URL('../../server/data/catalog.fixture.json', import.meta.url), 'utf8'),
  ),
)
const cze = zoneByCode(catalog, 'CZE00')!
const fra = zoneByCode(catalog, 'FRA00')!

describe('상세 선택기 (catalog spec D-3 · D-16 · E2E-13)', () => {
  it('기본 = 무제한 · 7일 · 매일 1GB', () => {
    expect(initialSelection(cze)).toEqual({ kind: 'U', cap: 1, days: 7 })
  })

  it('7일 카드 — 큰 용량부터, 가격 = K1 최종가, 하루 약 N원(내림)', () => {
    const cards = planCards(cze, initialSelection(cze))
    expect(cards.map((c) => [c.cap, c.option.finalWon, c.unitWon, c.selected])).toEqual([
      [3, 12700, 1814, false],
      [2, 9100, 1300, false],
      [1, 4900, 700, true],
    ])
    expect(cards.map((c) => c.option.code)).toEqual([
      'CZE00U03D07V2',
      'CZE00U02D07V2',
      'CZE00U01D07V2',
    ])
  })

  it('기간을 바꿔도 고른 용량은 유지되고 카드 가격이 그 기간 값으로 바뀐다', () => {
    const s = withDays(cze, withCap(cze, initialSelection(cze), 2), 30)
    expect(s).toEqual({ kind: 'U', cap: 2, days: 30 })
    expect(planCards(cze, s).find((c) => c.selected)!.option.code).toBe('CZE00U02D30V2')
  })

  it('드롭다운 = 무제한 1~30 · 60 · 90일(32개) / 종량제 30일 한 칸', () => {
    expect(periodOptions(cze, 'U')).toHaveLength(32)
    expect(periodOptions(cze, 'L')).toEqual([30])
  })

  it('종량제 탭 → 30일 · 가장 작은 용량, 카드 7장(총 30GB … 1GB) · 1GB당 약 N원', () => {
    const s = withKind(cze, initialSelection(cze), 'L')
    expect(s).toEqual({ kind: 'L', cap: 1, days: 30 })
    const cards = planCards(cze, withCap(cze, s, 10))
    expect(cards.map((c) => c.cap)).toEqual([30, 20, 10, 7, 5, 3, 1])
    expect(cards.find((c) => c.selected)).toMatchObject({
      cap: 10,
      unitWon: 2200,
      option: { finalWon: 22000 },
    })
  })

  it('무제한으로 돌아오면 무제한 기본값', () => {
    const s = withKind(cze, withKind(cze, initialSelection(cze), 'L'), 'U')
    expect(s).toEqual({ kind: 'U', cap: 1, days: 7 })
  })

  it('종량제가 없는 zone 에서 종량제로 바꾸려 하면 그대로', () => {
    const s = initialSelection(fra)
    expect(withKind(fra, s, 'L')).toBe(s)
  })

  it('없는 용량 · 없는 기간은 무시한다', () => {
    const s = initialSelection(cze)
    expect(withCap(cze, s, 5)).toBe(s)
    expect(withDays(cze, s, 45)).toBe(s)
  })

  it('요약 한 줄 · 고른 옵션', () => {
    const s = withCap(cze, initialSelection(cze), 2)
    expect(selectionLabel(cze, s)).toBe('체코 · 매일 2GB · 7일')
    expect(selectionLabel(cze, withKind(cze, s, 'L'))).toBe('체코 · 총 1GB · 30일')
    expect(selectedOption(cze, s)!.finalWon).toBe(9100)
  })
})
