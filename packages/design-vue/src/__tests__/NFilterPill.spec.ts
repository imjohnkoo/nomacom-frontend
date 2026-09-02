import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NFilterPill from '../components/NFilterPill/NFilterPill.vue'

describe('NFilterPill', () => {
  it('renders label slot + default classes', () => {
    const wrapper = mount(NFilterPill, { slots: { default: '전체' } })
    expect(wrapper.classes()).toContain('n-filter-pill')
    expect(wrapper.classes()).toContain('n-filter-pill--sm')
    expect(wrapper.find('.n-filter-pill__label').text()).toBe('전체')
    expect(wrapper.find('.n-filter-pill__count').exists()).toBe(false)
  })

  it('renders count when provided', () => {
    const wrapper = mount(NFilterPill, {
      props: { count: 1234 },
      slots: { default: '활성' },
    })
    expect(wrapper.find('.n-filter-pill__count').text()).toBe('1,234')
  })

  it('applies active modifier', () => {
    const wrapper = mount(NFilterPill, { props: { active: true } })
    expect(wrapper.classes()).toContain('n-filter-pill--active')
    expect(wrapper.attributes('aria-pressed')).toBe('true')
  })

  it('emits click when not disabled', async () => {
    const wrapper = mount(NFilterPill)
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('suppresses click when disabled', async () => {
    const wrapper = mount(NFilterPill, { props: { disabled: true } })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeFalsy()
    expect(wrapper.classes()).toContain('n-filter-pill--disabled')
  })

  // --- a11y ---

  it('실제 button 이라 키보드로 활성화된다', () => {
    const wrapper = mount(NFilterPill, { slots: { default: '전체' } })
    expect(wrapper.element.tagName).toBe('BUTTON')
    expect(wrapper.attributes('type')).toBe('button')
  })

  it('선택 여부를 색이 아니라 aria-pressed 로 알린다', () => {
    const wrapper = mount(NFilterPill)
    expect(wrapper.attributes('aria-pressed')).toBe('false')
  })

  it('count 는 숫자를 감추고 단위를 붙인 sr-only 텍스트로 낭독된다', () => {
    const wrapper = mount(NFilterPill, {
      props: { count: 1234 },
      slots: { default: '진행중' },
    })
    expect(wrapper.find('.n-filter-pill__count').attributes('aria-hidden')).toBe(
      'true',
    )
    expect(wrapper.find('.n-filter-pill__sr-only').text()).toBe('1,234건')
  })
})
