import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NStepProgress from '../components/NStepProgress/NStepProgress.vue'

describe('NStepProgress', () => {
  it('renders correct number of segments', () => {
    const wrapper = mount(NStepProgress, { props: { step: 2, total: 5 } })
    expect(wrapper.findAll('.n-step-progress__seg').length).toBe(5)
  })

  it('marks segments active up to step', () => {
    const wrapper = mount(NStepProgress, { props: { step: 3, total: 4 } })
    const active = wrapper.findAll('.n-step-progress__seg--active')
    expect(active.length).toBe(3)
  })

  it('renders n / total label', () => {
    const wrapper = mount(NStepProgress, {
      props: { step: 2, total: 4, label: '본인 확인' },
    })
    expect(wrapper.text()).toContain('2 / 4')
    expect(wrapper.text()).toContain('본인 확인')
  })

  it('hides label when showLabel=false', () => {
    const wrapper = mount(NStepProgress, {
      props: { step: 1, total: 4, showLabel: false },
    })
    expect(wrapper.find('.n-step-progress__label').exists()).toBe(false)
  })

  it('sets aria-valuenow', () => {
    const wrapper = mount(NStepProgress, { props: { step: 2 } })
    expect(wrapper.attributes('aria-valuenow')).toBe('2')
    expect(wrapper.attributes('aria-valuemax')).toBe('4')
  })
})
