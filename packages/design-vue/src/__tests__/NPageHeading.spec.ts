import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NPageHeading from '../components/NPageHeading/NPageHeading.vue'

describe('NPageHeading', () => {
  it('renders title and description', () => {
    const wrapper = mount(NPageHeading, {
      props: { title: '제목', description: '설명' },
    })
    expect(wrapper.text()).toContain('제목')
    expect(wrapper.text()).toContain('설명')
  })

  it('renders eyebrow', () => {
    const wrapper = mount(NPageHeading, {
      props: { title: 'T', eyebrow: 'eyebrow' },
    })
    expect(wrapper.text()).toContain('eyebrow')
  })

  it('omits description when not provided', () => {
    const wrapper = mount(NPageHeading, { props: { title: 'T' } })
    expect(wrapper.find('.n-page-heading__desc').exists()).toBe(false)
  })

  it('preserves newlines via pre-line', () => {
    const wrapper = mount(NPageHeading, {
      props: { title: 'A\nB' },
    })
    expect(wrapper.find('.n-page-heading__title').text()).toBe('A\nB')
  })
})
