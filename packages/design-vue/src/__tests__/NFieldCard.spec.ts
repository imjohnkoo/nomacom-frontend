import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NFieldCard from '../components/NFieldCard/NFieldCard.vue'

describe('NFieldCard', () => {
  it('renders label and value', () => {
    const wrapper = mount(NFieldCard, {
      props: { label: '시작 국가', value: '일본' },
    })
    expect(wrapper.text()).toContain('시작 국가')
    expect(wrapper.text()).toContain('일본')
  })

  it('shows placeholder when value empty', () => {
    const wrapper = mount(NFieldCard, {
      props: { label: 'X', placeholder: '선택해 주세요' },
    })
    expect(wrapper.text()).toContain('선택해 주세요')
  })

  it('applies active class', () => {
    const wrapper = mount(NFieldCard, {
      props: { label: 'X', value: 'v', active: true },
    })
    expect(wrapper.classes()).toContain('n-field-card--active')
  })

  it('applies error class', () => {
    const wrapper = mount(NFieldCard, {
      props: { label: 'X', error: true },
    })
    expect(wrapper.classes()).toContain('n-field-card--error')
  })

  it('emits click when not disabled', async () => {
    const wrapper = mount(NFieldCard, { props: { label: 'X' } })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('does not emit click when disabled', async () => {
    const wrapper = mount(NFieldCard, { props: { label: 'X', disabled: true } })
    await wrapper.trigger('click')
    // disabled button doesn't fire click handler in JSDOM/happy-dom
    expect(wrapper.emitted('click')).toBeFalsy()
  })
})
