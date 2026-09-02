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

describe('NKpi — trend (상승이 좋은지 나쁜지)', () => {
  // 회귀 방지: 상승 = 초록으로 고정하면 취소율·실패율 급등이 「좋아졌다」로 읽힌다.
  it('기본(up-good)은 상승을 positive 로 칠한다', () => {
    const w = mount(NKpi, { props: { label: '매출', value: '1', delta: '+8.2%' } })
    expect(w.find('.n-kpi__delta').classes()).toContain('n-kpi__delta--positive')
  })

  it('up-bad 는 상승을 negative 로 칠한다', () => {
    const w = mount(NKpi, {
      props: { label: '취소율', value: '2.1', delta: '+0.3%p', trend: 'up-bad' },
    })
    const cls = w.find('.n-kpi__delta').classes()
    expect(cls).toContain('n-kpi__delta--negative')
    expect(cls).not.toContain('n-kpi__delta--positive')
  })

  it('up-bad 는 하락을 positive 로 칠한다', () => {
    const w = mount(NKpi, {
      props: { label: '취소율', value: '1.8', delta: '-0.3%p', trend: 'up-bad' },
    })
    expect(w.find('.n-kpi__delta').classes()).toContain('n-kpi__delta--positive')
  })

  it('neutral 은 좋고 나쁨을 주장하지 않는다', () => {
    const w = mount(NKpi, {
      props: { label: '접속자', value: '120', delta: '+12', trend: 'neutral' },
    })
    expect(w.find('.n-kpi__delta').classes()).toContain('n-kpi__delta--muted')
  })

  it('색과 무관하게 방향 기호·낭독 문구는 실제 증감을 따른다', () => {
    const w = mount(NKpi, {
      props: { label: '취소율', value: '2.1', delta: '+0.3%p', trend: 'up-bad' },
    })
    expect(w.find('.n-kpi__delta').classes()).toContain('n-kpi__delta--up')
    expect(w.text()).toContain('증가')
  })
})
