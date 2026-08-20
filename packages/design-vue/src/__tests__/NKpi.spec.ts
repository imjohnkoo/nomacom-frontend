import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NKpi from '../components/NKpi/NKpi.vue'

describe('NKpi', () => {
  it('renders label and value', () => {
    const wrapper = mount(NKpi, { props: { label: '전체', value: 128 } })
    expect(wrapper.find('.n-kpi__label').text()).toBe('전체')
    expect(wrapper.find('.n-kpi__value').text()).toBe('128')
  })

  it('renders suffix + delta + sub when provided', () => {
    const wrapper = mount(NKpi, {
      props: { label: 'Contact', value: 342, suffix: '건', delta: '+28', sub: '/ 11' },
    })
    expect(wrapper.find('.n-kpi__suffix').text()).toBe('건')
    expect(wrapper.find('.n-kpi__delta').text()).toContain('+28')
    expect(wrapper.find('.n-kpi__sub').text()).toBe('/ 11')
  })

  it.each(['success', 'warning', 'danger', 'primary'] as const)(
    'applies accent class: %s',
    (accent) => {
      const wrapper = mount(NKpi, { props: { label: 'X', value: 1, accent } })
      expect(wrapper.classes()).toContain(`n-kpi--${accent}`)
    },
  )

  it('renders hint slot when provided', () => {
    const wrapper = mount(NKpi, {
      props: { label: 'X', value: 1 },
      slots: { hint: '<span class="t">지난 주 대비</span>' },
    })
    expect(wrapper.find('.n-kpi__hint .t').exists()).toBe(true)
  })

  // 색상만으로 증감을 전달하지 않는다 — 기호 + sr-only 문구가 함께 나와야 한다
  it('marks a positive delta as up with symbol and screen-reader text', () => {
    const wrapper = mount(NKpi, { props: { label: 'X', value: 1, delta: '+28' } })
    const delta = wrapper.find('.n-kpi__delta')
    expect(delta.classes()).toContain('n-kpi__delta--up')
    expect(delta.find('.n-kpi__delta-symbol').text()).toBe('▲')
    expect(delta.find('.n-kpi__sr-only').text()).toBe('증가')
  })

  it('marks a negative delta as down', () => {
    const wrapper = mount(NKpi, { props: { label: 'X', value: 1, delta: '-4' } })
    const delta = wrapper.find('.n-kpi__delta')
    expect(delta.classes()).toContain('n-kpi__delta--down')
    expect(delta.find('.n-kpi__sr-only').text()).toBe('감소')
  })

  it('falls back to flat when the delta carries no sign', () => {
    const wrapper = mount(NKpi, { props: { label: 'X', value: 1, delta: '2배' } })
    const delta = wrapper.find('.n-kpi__delta')
    expect(delta.classes()).toContain('n-kpi__delta--flat')
    expect(delta.find('.n-kpi__delta-symbol').exists()).toBe(false)
  })

  it('honours an explicit deltaDirection over the sign heuristic', () => {
    const wrapper = mount(NKpi, {
      props: { label: 'X', value: 1, delta: '+28', deltaDirection: 'down' },
    })
    expect(wrapper.find('.n-kpi__delta').classes()).toContain('n-kpi__delta--down')
  })

  it('renders only the value slot as a busy skeleton while loading', () => {
    const wrapper = mount(NKpi, { props: { label: '전체', value: 128, loading: true } })
    const skeleton = wrapper.find('.n-kpi__value-skeleton')
    expect(skeleton.exists()).toBe(true)
    expect(skeleton.attributes('role')).toBe('status')
    expect(skeleton.attributes('aria-busy')).toBe('true')
    expect(skeleton.text()).toBe('불러오는 중')
    // 라벨은 로딩 중에도 유지된다
    expect(wrapper.find('.n-kpi__label').text()).toBe('전체')
    expect(wrapper.find('.n-kpi__value').exists()).toBe(false)
  })
})
