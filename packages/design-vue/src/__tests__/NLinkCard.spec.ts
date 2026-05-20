import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NLinkCard from '../components/NLinkCard/NLinkCard.vue'

describe('NLinkCard', () => {
  it('renders label and sub', () => {
    const wrapper = mount(NLinkCard, {
      props: { label: '아이폰 설치', sub: 'iOS · Universal Link' },
    })
    expect(wrapper.text()).toContain('아이폰 설치')
    expect(wrapper.text()).toContain('iOS · Universal Link')
  })

  it('renders as anchor when href provided', () => {
    const wrapper = mount(NLinkCard, {
      props: { label: 'X', href: 'https://example.com', external: true },
    })
    expect(wrapper.element.tagName.toLowerCase()).toBe('a')
    expect(wrapper.attributes('target')).toBe('_blank')
    expect(wrapper.attributes('rel')).toContain('noopener')
  })

  it('renders as button when href not provided', () => {
    const wrapper = mount(NLinkCard, { props: { label: 'X' } })
    expect(wrapper.element.tagName.toLowerCase()).toBe('button')
  })

  it('emits click event', async () => {
    const wrapper = mount(NLinkCard, { props: { label: 'X' } })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('renders icon slot', () => {
    const wrapper = mount(NLinkCard, {
      props: { label: 'X' },
      slots: { icon: '<i data-test="ico" />' },
    })
    expect(wrapper.find('[data-test="ico"]').exists()).toBe(true)
  })
})
