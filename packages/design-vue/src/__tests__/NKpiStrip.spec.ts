import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NKpiStrip from '../components/NKpiStrip/NKpiStrip.vue'

describe('NKpiStrip', () => {
  it('renders default slot', () => {
    const wrapper = mount(NKpiStrip, { slots: { default: '<span class="child">A</span>' } })
    expect(wrapper.find('.n-kpi-strip').exists()).toBe(true)
    expect(wrapper.find('.child').exists()).toBe(true)
  })

  it('applies divided by default', () => {
    const wrapper = mount(NKpiStrip)
    expect(wrapper.classes()).toContain('n-kpi-strip--divided')
  })

  it('omits divided modifier when prop is false', () => {
    const wrapper = mount(NKpiStrip, { props: { divided: false } })
    expect(wrapper.classes()).not.toContain('n-kpi-strip--divided')
  })

  it('applies border-top modifier when enabled', () => {
    const wrapper = mount(NKpiStrip, { props: { borderTop: true } })
    expect(wrapper.classes()).toContain('n-kpi-strip--border-top')
  })

  it.each(['sm', 'md', 'lg'] as const)('applies gap class: %s', (gap) => {
    const wrapper = mount(NKpiStrip, { props: { gap } })
    expect(wrapper.classes()).toContain(`n-kpi-strip--gap-${gap}`)
  })
})
