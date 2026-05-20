import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import NCodeRow from '../components/NCodeRow/NCodeRow.vue'

describe('NCodeRow', () => {
  it('renders label and value', () => {
    const wrapper = mount(NCodeRow, {
      props: { label: 'SM-DP+', value: 'smdp.io.idemia.io' },
    })
    expect(wrapper.text()).toContain('SM-DP+')
    expect(wrapper.text()).toContain('smdp.io.idemia.io')
  })

  it('emits copied event on click and writes to clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })

    const wrapper = mount(NCodeRow, {
      props: { label: 'L', value: 'abc-def' },
    })
    await wrapper.find('button').trigger('click')
    await nextTick()
    expect(writeText).toHaveBeenCalledWith('abc-def')
    expect(wrapper.emitted('copied')?.[0]).toEqual(['abc-def'])
  })

  it('applies copied class after click', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
    })
    const wrapper = mount(NCodeRow, { props: { label: 'L', value: 'v' } })
    await wrapper.find('button').trigger('click')
    await nextTick()
    expect(wrapper.find('button').classes()).toContain('n-code-row__copy--copied')
  })

  it('uses custom copy labels', () => {
    const wrapper = mount(NCodeRow, {
      props: { label: 'L', value: 'v', copyLabel: 'COPY', copiedLabel: 'DONE' },
    })
    expect(wrapper.find('button').text()).toContain('COPY')
  })
})
