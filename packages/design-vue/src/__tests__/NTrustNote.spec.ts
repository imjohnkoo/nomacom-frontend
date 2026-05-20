import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NTrustNote from '../components/NTrustNote/NTrustNote.vue'

describe('NTrustNote', () => {
  it('renders default shield icon when no slot', () => {
    const wrapper = mount(NTrustNote, { slots: { default: 'body text' } })
    expect(wrapper.text()).toContain('body text')
    // built-in svg in icon slot
    expect(wrapper.find('.n-trust-note__icon svg').exists()).toBe(true)
  })

  it('renders custom icon slot', () => {
    const wrapper = mount(NTrustNote, {
      slots: {
        icon: '<i data-test="custom" />',
        default: 'msg',
      },
    })
    expect(wrapper.find('[data-test="custom"]').exists()).toBe(true)
  })

  it('places content inside body', () => {
    const wrapper = mount(NTrustNote, { slots: { default: '<p>hello</p>' } })
    expect(wrapper.find('.n-trust-note__body').html()).toContain('hello')
  })
})
