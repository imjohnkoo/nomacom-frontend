import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NStatusPill from '../components/NStatusPill/NStatusPill.vue'

describe('NStatusPill', () => {
  it('renders default label', () => {
    const wrapper = mount(NStatusPill, { props: { label: '주문완료' } })
    expect(wrapper.text()).toContain('주문완료')
  })

  it('applies color class', () => {
    const wrapper = mount(NStatusPill, {
      props: { label: 'X', color: 'info' },
    })
    expect(wrapper.classes()).toContain('n-status-pill--info')
  })

  it('renders dot when prop set', () => {
    const wrapper = mount(NStatusPill, { props: { label: 'X', dot: true } })
    expect(wrapper.find('.n-status-pill__dot').exists()).toBe(true)
  })

  it('renders icon slot over dot', () => {
    const wrapper = mount(NStatusPill, {
      props: { label: 'X', dot: true },
      slots: { icon: '<i data-test="ico" />' },
    })
    expect(wrapper.find('[data-test="ico"]').exists()).toBe(true)
    expect(wrapper.find('.n-status-pill__dot').exists()).toBe(false)
  })
})
