import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NSegmentedControl from '../components/NSegmentedControl/NSegmentedControl.vue'

/**
 * radiogroup 키보드 조작 회귀 방어.
 *
 * 실측 배경: `role="radiogroup"` + `role="radio"` 를 선언해놓고 keydown 핸들러와
 * roving tabindex 가 **0건**인 구현이 흔하다. 스크린리더는 라디오 그룹이라고 안내하는데
 * 화살표키가 듣지 않아, 그 안내를 믿은 사용자가 조작을 못 하는 상태가 된다.
 * 뱃지도 `aria-hidden="true"` 면 「대기」 는 읽히고 건수는 낭독되지 않는다.
 */
describe('NSegmentedControl a11y', () => {
  const options = [
    { label: '전체', value: 'all' },
    { label: '발급중', value: 'issuing', badge: 12 },
    { label: '완료', value: 'done' },
  ]

  it('그룹 전체가 탭 정지 1개다 — 선택 항목만 tabindex=0', () => {
    const w = mount(NSegmentedControl, {
      props: { options, modelValue: 'issuing' },
    })
    const tabindexes = w.findAll('button').map((b) => b.attributes('tabindex'))
    expect(tabindexes).toEqual(['-1', '0', '-1'])
  })

  it('선택값이 없으면 첫 활성 항목이 탭 정지를 받는다', () => {
    const w = mount(NSegmentedControl, { props: { options } })
    expect(w.findAll('button')[0].attributes('tabindex')).toBe('0')
  })

  it('radiogroup / radio role 과 aria-checked 를 노출한다', () => {
    const w = mount(NSegmentedControl, {
      props: { options, modelValue: 'issuing' },
    })
    expect(w.attributes('role')).toBe('radiogroup')
    const checked = w.findAll('button').map((b) => b.attributes('aria-checked'))
    expect(checked).toEqual(['false', 'true', 'false'])
  })

  it('ArrowRight 가 다음 항목을 선택한다', async () => {
    const w = mount(NSegmentedControl, { props: { options, modelValue: 'all' } })
    await w.findAll('button')[0].trigger('keydown', { key: 'ArrowRight' })
    expect(w.emitted('update:modelValue')?.[0]).toEqual(['issuing'])
  })

  it('ArrowLeft 가 양끝에서 순환한다', async () => {
    const w = mount(NSegmentedControl, { props: { options, modelValue: 'all' } })
    await w.findAll('button')[0].trigger('keydown', { key: 'ArrowLeft' })
    expect(w.emitted('update:modelValue')?.[0]).toEqual(['done'])
  })

  it('Home/End 가 처음·끝으로 간다', async () => {
    const w = mount(NSegmentedControl, {
      props: { options, modelValue: 'issuing' },
    })
    await w.findAll('button')[1].trigger('keydown', { key: 'Home' })
    await w.findAll('button')[1].trigger('keydown', { key: 'End' })
    expect(w.emitted('update:modelValue')).toEqual([['all'], ['done']])
  })

  it('disabled 항목을 건너뛴다', async () => {
    const opts = [
      { label: 'A', value: 'a' },
      { label: 'B', value: 'b', disabled: true },
      { label: 'C', value: 'c' },
    ]
    const w = mount(NSegmentedControl, {
      props: { options: opts, modelValue: 'a' },
    })
    await w.findAll('button')[0].trigger('keydown', { key: 'ArrowRight' })
    expect(w.emitted('update:modelValue')?.[0]).toEqual(['c'])
  })

  it('뱃지가 낭독된다 — aria-hidden 이 아니어야 한다', () => {
    const w = mount(NSegmentedControl, { props: { options, modelValue: 'all' } })
    const badge = w.find('.n-segmented-control__badge')
    expect(badge.exists()).toBe(true)
    expect(badge.attributes('aria-hidden')).toBeUndefined()
    expect(badge.attributes('aria-label')).toBe('12')
  })

  it('경고 뱃지는 색 말고도 낭독으로 구분된다', () => {
    const opts = [{ label: '지연', value: 'x', badge: 3, badgeWarn: true }]
    const w = mount(NSegmentedControl, {
      props: { options: opts, modelValue: 'x' },
    })
    expect(w.find('.n-segmented-control__badge').attributes('aria-label')).toBe(
      '3 (주의)',
    )
  })

  it('다른 키는 가로채지 않는다 (Tab 등)', async () => {
    const w = mount(NSegmentedControl, { props: { options, modelValue: 'all' } })
    await w.findAll('button')[0].trigger('keydown', { key: 'Tab' })
    expect(w.emitted('update:modelValue')).toBeUndefined()
  })

  it('size prop 이 실제로 클래스로 반영된다 (raw DOM 속성으로 새지 않는다)', () => {
    const w = mount(NSegmentedControl, { props: { options, size: 'sm' } })
    expect(w.classes()).toContain('n-segmented-control--sm')
    expect(w.attributes('size')).toBeUndefined()
  })
})
