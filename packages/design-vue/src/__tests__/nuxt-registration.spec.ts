import { describe, it, expect } from 'vitest'
import { NUXT_COMPONENTS } from '../nuxt-components'
import * as DS from '../components'

/**
 * Nuxt 모듈의 등록 목록은 손으로 관리한다. 이 테스트가 그 목록을 실제 export 와 묶어둔다.
 *
 * 없으면 벌어지는 일: 새 컴포넌트를 만들고 barrel 에는 넣었는데 nuxt.ts 를 잊는다.
 * 그러면 앱에서 `<NNewThing>` 이 조용히 «미등록 커스텀 엘리먼트» 로 렌더돼
 * 에러 없이 화면만 비어 있다. 런타임에 알아채기 가장 어려운 종류의 실패다.
 */

/** barrel 에서 컴포넌트만 추린다 (컴포저블 `useXxx`, 타입은 제외). */
function exportedComponentNames(): string[] {
  return Object.entries(DS)
    .filter(([name, value]) => {
      if (!/^N[A-Z]/.test(name)) return false
      // SFC 는 객체로, defineComponent 도 객체로 컴파일된다.
      return typeof value === 'object' && value !== null
    })
    .map(([name]) => name)
    .sort()
}

describe('Nuxt 모듈 등록 목록', () => {
  it('barrel 이 export 하는 모든 컴포넌트가 등록돼 있다', () => {
    const registered = new Set<string>(NUXT_COMPONENTS)
    const missing = exportedComponentNames().filter((name) => !registered.has(name))
    expect(missing, `nuxt.ts 에 누락된 컴포넌트: ${missing.join(', ')}`).toEqual([])
  })

  it('등록 목록에 실제로 존재하지 않는 컴포넌트가 없다', () => {
    const exported = new Set(exportedComponentNames())
    const phantom = NUXT_COMPONENTS.filter((name) => !exported.has(name))
    expect(phantom, `barrel 에 없는데 등록된 이름: ${phantom.join(', ')}`).toEqual([])
  })

  it('중복 등록이 없다', () => {
    const seen = new Set<string>()
    const duplicates = NUXT_COMPONENTS.filter((name) => {
      if (seen.has(name)) return true
      seen.add(name)
      return false
    })
    expect(duplicates).toEqual([])
  })
})
