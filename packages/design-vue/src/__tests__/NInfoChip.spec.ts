import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NInfoChip from '../components/NInfoChip/NInfoChip.vue'

describe('NInfoChip', () => {
  it('renders label and value', () => {
    const wrapper = mount(NInfoChip, {
      props: { label: '주문번호', value: '12345' },
    })
    expect(wrapper.text()).toContain('주문번호')
    expect(wrapper.text()).toContain('12345')
  })

  it('applies brand-50 background class', () => {
    const wrapper = mount(NInfoChip, { props: { label: 'L' } })
    expect(wrapper.classes()).toContain('n-info-chip')
  })

  it('renders icon slot', () => {
    const wrapper = mount(NInfoChip, {
      props: { label: 'L' },
      slots: { icon: '<svg data-test="icon" />' },
    })
    expect(wrapper.find('[data-test="icon"]').exists()).toBe(true)
  })
})
