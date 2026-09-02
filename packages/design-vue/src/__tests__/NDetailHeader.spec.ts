import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NDetailHeader from '../components/NDetailHeader/NDetailHeader.vue'

describe('NDetailHeader', () => {
  it('renders the title as an h1 by default', () => {
    const wrapper = mount(NDetailHeader, { props: { title: '노마컴 스토어' } })
    const title = wrapper.find('.n-detail-header__title')
    expect(title.element.tagName).toBe('H1')
    expect(title.text()).toBe('노마컴 스토어')
  })

  it('allows lowering the heading level', () => {
    const wrapper = mount(NDetailHeader, { props: { title: 'X', titleTag: 'h2' } })
    expect(wrapper.find('.n-detail-header__title').element.tagName).toBe('H2')
  })

  it('renders meta items with · separators and mono/locked markers', () => {
    const wrapper = mount(NDetailHeader, {
      props: {
        title: 'X',
        meta: [
          { label: '주문번호', value: 'ORD-1', mono: true },
          { label: '생성일', value: '2026-08-20', locked: true },
        ],
      },
    })
    expect(wrapper.findAll('.n-detail-header__meta-item')).toHaveLength(2)
    const sep = wrapper.find('.n-detail-header__sep')
    // 구분자는 장식이므로 낭독기에서 감춘다
    expect(sep.attributes('aria-hidden')).toBe('true')
    expect(wrapper.find('.n-detail-header__mono').text()).toBe('ORD-1')
    const lock = wrapper.find('.n-detail-header__lock')
    expect(lock.attributes('role')).toBe('img')
    expect(lock.attributes('aria-label')).toBe('시스템 값 — 수정 불가')
  })

  it('switches to the avatar layout when avatarText is given', () => {
    const wrapper = mount(NDetailHeader, { props: { title: 'X', avatarText: '노' } })
    expect(wrapper.classes()).toContain('n-detail-header--with-avatar')
    expect(wrapper.find('.n-detail-header__avatar').text()).toBe('노')
  })

  it('renders a bordered KPI strip only when the kpis slot is used', () => {
    const bare = mount(NDetailHeader, { props: { title: 'X' } })
    expect(bare.find('.n-kpi-strip').exists()).toBe(false)

    const wrapper = mount(NDetailHeader, {
      props: { title: 'X' },
      slots: { kpis: '<div class="kpi">A</div>' },
    })
    const strip = wrapper.find('.n-kpi-strip')
    expect(strip.exists()).toBe(true)
    expect(strip.classes()).toContain('n-kpi-strip--border-top')
    expect(wrapper.find('.kpi').exists()).toBe(true)
  })

  it('renders badges / aside / extra slots', () => {
    const wrapper = mount(NDetailHeader, {
      props: { title: 'X' },
      slots: {
        badges: '<span class="badge" />',
        aside: '<a class="chip" />',
        extra: '<p class="extra" />',
      },
    })
    expect(wrapper.find('.n-detail-header__row .badge').exists()).toBe(true)
    expect(wrapper.find('.n-detail-header__aside .chip').exists()).toBe(true)
    expect(wrapper.find('.extra').exists()).toBe(true)
  })
})
