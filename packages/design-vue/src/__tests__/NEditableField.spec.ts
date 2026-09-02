import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import NEditableField from '../components/NEditableField/NEditableField.vue'

describe('NEditableField (smoke)', () => {
  it('renders a real <button> trigger in display mode', () => {
    const w = mount(NEditableField, { props: { modelValue: '홍길동' } })
    const btn = w.find('button.n-editable-field__trigger')
    expect(btn.exists()).toBe(true)
    expect(btn.attributes('type')).toBe('button')
    expect(w.text()).toContain('홍길동')
    expect(w.text()).toContain('편집')
  })

  it('renders a <span> (not button) + readonly reason when readonly', () => {
    const w = mount(NEditableField, {
      props: { modelValue: 'x', readonly: true, readonlyReason: '발급 후 변경 불가' },
    })
    expect(w.find('button.n-editable-field__trigger').exists()).toBe(false)
    expect(w.find('span.n-editable-field__trigger').exists()).toBe(true)
    expect(w.text()).toContain('발급 후 변경 불가')
    expect(w.find('.n-editable-field__lock').exists()).toBe(true)
  })

  it('shows emptyText when value is blank', () => {
    const w = mount(NEditableField, { props: { modelValue: '   ', emptyText: '없음' } })
    expect(w.find('.n-editable-field__empty').text()).toBe('없음')
  })

  it('enters edit mode, focuses input, saves via Enter and emits after saveFn', async () => {
    const saveFn = vi.fn().mockResolvedValue(undefined)
    const w = mount(NEditableField, {
      props: { modelValue: 'a', saveFn },
      attachTo: document.body,
    })
    await w.find('button.n-editable-field__trigger').trigger('click')
    await nextTick()
    const input = w.find('input')
    expect(input.exists()).toBe(true)
    expect(document.activeElement).toBe(input.element)

    await input.setValue('b')
    await w.find('.n-editable-field__control').trigger('keydown', { key: 'Enter' })
    await nextTick()
    await nextTick()

    expect(saveFn).toHaveBeenCalledWith('b')
    expect(w.emitted('update:modelValue')?.[0]).toEqual(['b'])
    expect(w.emitted('save')?.[0]).toEqual(['b'])
    // back to display mode + focus returned to the trigger
    await nextTick()
    expect(w.find('button.n-editable-field__trigger').exists()).toBe(true)
    expect(document.activeElement).toBe(w.find('button.n-editable-field__trigger').element)
    w.unmount()
  })

  it('Escape cancels and restores focus to the trigger', async () => {
    const w = mount(NEditableField, { props: { modelValue: 'a' }, attachTo: document.body })
    await w.find('button.n-editable-field__trigger').trigger('click')
    await nextTick()
    await w.find('.n-editable-field__control').trigger('keydown', { key: 'Escape' })
    await nextTick()
    expect(w.emitted('cancel')).toBeTruthy()
    expect(w.find('button.n-editable-field__trigger').exists()).toBe(true)
    expect(document.activeElement).toBe(w.find('button.n-editable-field__trigger').element)
    w.unmount()
  })

  it('runs autoFormat before validate, and keeps edit mode open on validation error', async () => {
    const autoFormat = vi.fn((v: unknown) => String(v).trim())
    const validate = vi.fn((v: unknown) => (String(v).length < 3 ? '3자 이상' : null))
    const w = mount(NEditableField, { props: { modelValue: 'aaaa', autoFormat, validate } })
    await w.find('button.n-editable-field__trigger').trigger('click')
    await nextTick()
    await w.find('input').setValue('  ab  ')
    await w.find('.n-editable-field__save').trigger('click')
    await nextTick()
    expect(autoFormat).toHaveBeenCalledWith('  ab  ')
    expect(validate).toHaveBeenCalledWith('ab')
    const err = w.find('.n-editable-field__error')
    expect(err.exists()).toBe(true)
    expect(err.attributes('role')).toBe('alert')
    expect(w.find('input').attributes('aria-describedby')).toBe(err.attributes('id'))
    expect(w.find('input').attributes('aria-invalid')).toBe('true')
    expect(w.emitted('save')).toBeFalsy()
  })

  it('keeps edit mode + surfaces the message when saveFn throws', async () => {
    const saveFn = vi.fn().mockRejectedValue(new Error('서버 거절'))
    const w = mount(NEditableField, { props: { modelValue: 'a', saveFn } })
    await w.find('button.n-editable-field__trigger').trigger('click')
    await nextTick()
    await w.find('input').setValue('b')
    await w.find('.n-editable-field__save').trigger('click')
    await nextTick()
    await nextTick()
    expect(w.find('.n-editable-field__error').text()).toBe('서버 거절')
    expect(w.emitted('error')).toBeTruthy()
    expect(w.emitted('update:modelValue')).toBeFalsy()
    expect(w.find('input').exists()).toBe(true)
  })

  it('parses number type on save', async () => {
    const saveFn = vi.fn().mockResolvedValue(undefined)
    const w = mount(NEditableField, { props: { modelValue: 1, type: 'number', saveFn } })
    await w.find('button.n-editable-field__trigger').trigger('click')
    await nextTick()
    expect(w.find('input').attributes('inputmode')).toBe('decimal')
    await w.find('input').setValue('42')
    await w.find('.n-editable-field__save').trigger('click')
    await nextTick()
    await nextTick()
    expect(saveFn).toHaveBeenCalledWith(42)
  })

  it('textarea: plain Enter does not save, Ctrl+Enter does', async () => {
    const saveFn = vi.fn().mockResolvedValue(undefined)
    const w = mount(NEditableField, { props: { modelValue: 'a', type: 'textarea', saveFn } })
    await w.find('button.n-editable-field__trigger').trigger('click')
    await nextTick()
    await w.find('textarea').setValue('multi')
    await w.find('.n-editable-field__control').trigger('keydown', { key: 'Enter' })
    await nextTick()
    expect(saveFn).not.toHaveBeenCalled()
    await w.find('.n-editable-field__control').trigger('keydown', { key: 'Enter', ctrlKey: true })
    await nextTick()
    await nextTick()
    expect(saveFn).toHaveBeenCalledWith('multi')
  })

  it('no-change shortcut closes without calling saveFn', async () => {
    const saveFn = vi.fn().mockResolvedValue(undefined)
    const w = mount(NEditableField, { props: { modelValue: 'a', saveFn } })
    await w.find('button.n-editable-field__trigger').trigger('click')
    await nextTick()
    await w.find('.n-editable-field__save').trigger('click')
    await nextTick()
    expect(saveFn).not.toHaveBeenCalled()
    expect(w.find('button.n-editable-field__trigger').exists()).toBe(true)
  })

  it('boolean type renders a checkbox and shows 사용/사용 안 함', async () => {
    const w = mount(NEditableField, { props: { modelValue: true, type: 'boolean' } })
    expect(w.text()).toContain('사용')
    await w.find('button.n-editable-field__trigger').trigger('click')
    await nextTick()
    expect(w.find('.n-checkbox').exists()).toBe(true)
  })

  it('select type renders NSelect by default and NInputMenu when searchable', async () => {
    const opts = [
      { label: 'A', value: 'a' },
      { label: 'B', value: 'b', disabled: true },
    ]
    const w = mount(NEditableField, {
      props: { modelValue: 'a', type: 'select', options: opts },
      attachTo: document.body,
    })
    await w.find('button.n-editable-field__trigger').trigger('click')
    await nextTick()
    expect(w.find('.n-select__trigger').exists()).toBe(true)
    w.unmount()

    const w2 = mount(NEditableField, {
      props: { modelValue: 'a', type: 'select', options: opts, searchable: true },
      attachTo: document.body,
    })
    await w2.find('button.n-editable-field__trigger').trigger('click')
    await nextTick()
    expect(w2.find('.n-input-menu').exists()).toBe(true)
    w2.unmount()
  })

  it('disables both action buttons while saving', async () => {
    let resolveSave: () => void = () => {}
    const saveFn = vi.fn(() => new Promise<void>((r) => (resolveSave = r)))
    const w = mount(NEditableField, { props: { modelValue: 'a', saveFn } })
    await w.find('button.n-editable-field__trigger').trigger('click')
    await nextTick()
    await w.find('input').setValue('b')
    w.find('.n-editable-field__save').trigger('click')
    await nextTick()
    expect(w.find('.n-editable-field__save').attributes('disabled')).toBeDefined()
    expect(w.find('.n-editable-field__cancel').attributes('disabled')).toBeDefined()
    expect(w.find('.n-editable-field__spinner').exists()).toBe(true)
    resolveSave()
    await nextTick()
    await nextTick()
    expect(saveFn).toHaveBeenCalledTimes(1)
  })

  it('mono + displayText props affect display rendering', () => {
    const w = mount(NEditableField, {
      props: { modelValue: 12345, mono: true, displayText: '1234-5678' },
    })
    const v = w.find('.n-editable-field__value')
    expect(v.text()).toBe('1234-5678')
    expect(v.classes()).toContain('n-editable-field__value--mono')
  })
})
