import { afterEach, describe, expect, it, vi } from 'vitest'
import { fixtureRaw, readRaw } from '../../shared/catalog/test-data'

/**
 * 서버 로더(spec F-1) — `assets:catalog` 에서 실 catalog.json 을 먼저, 없으면 표본을 읽는다.
 * Nitro 전역 useStorage 만 끼운다(메모가 모듈 안에 있어 케이스마다 모듈을 새로 읽는다).
 */
async function loaderWith(files: Record<string, unknown>) {
  vi.resetModules()
  const reads: string[] = []
  vi.stubGlobal('useStorage', () => ({
    getItem: async (name: string) => {
      reads.push(name)
      return files[name] ?? null
    },
  }))
  const { useCatalog } = await import('./catalog')
  return { useCatalog, reads }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useCatalog', () => {
  it('실 catalog.json 이 있으면 표본은 읽지 않는다', async () => {
    const { useCatalog, reads } = await loaderWith({
      'catalog.json': JSON.stringify(readRaw('server/data/catalog.json')),
      'catalog.fixture.json': JSON.stringify(fixtureRaw()),
    })
    const cat = await useCatalog()
    expect(cat.fixture).toBe(false)
    expect(reads).toEqual(['catalog.json'])
  })

  it('실 파일이 없으면 표본 · 둘 다 없으면 throw', async () => {
    const a = await loaderWith({ 'catalog.fixture.json': fixtureRaw() })
    expect((await a.useCatalog()).fixture).toBe(true)
    const b = await loaderWith({})
    await expect(b.useCatalog()).rejects.toThrow(/카탈로그 파일이 없다/)
  })

  it('한 번 검증해 메모한다(두 번째 요청은 다시 읽지 않는다)', async () => {
    const { useCatalog, reads } = await loaderWith({
      'catalog.json': readRaw('server/data/catalog.json'),
    })
    await useCatalog()
    await useCatalog()
    expect(reads).toEqual(['catalog.json'])
  })
})
