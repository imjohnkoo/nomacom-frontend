import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NDescriptionList from '../components/NDescriptionList/NDescriptionList.vue'

describe('NDescriptionList', () => {
  const items = [
    { label: '주문번호', value: 'NM-2026-0001' },
    { label: '요금제', value: '일본 5GB' },
    { label: '메모', value: null },
  ]

  /** div 로 흉내내면 스크린리더가 «용어–설명» 쌍을 묶어 읽지 못한다 */
  it('dl / dt / dd 시맨틱을 쓴다', () => {
    const w = mount(NDescriptionList, { props: { items } })
    expect(w.element.tagName).toBe('DL')
    expect(w.findAll('dt')).toHaveLength(3)
    expect(w.findAll('dd')).toHaveLength(3)
    expect(w.findAll('dt')[0].text()).toBe('주문번호')
    expect(w.findAll('dd')[0].text()).toBe('NM-2026-0001')
  })

  it('열 수 클래스를 반영한다 (기본 2열)', () => {
    expect(mount(NDescriptionList, { props: { items } }).classes()).toContain(
      'n-description-list--cols-2',
    )
    expect(
      mount(NDescriptionList, { props: { items, columns: 3 } }).classes(),
    ).toContain('n-description-list--cols-3')
  })

  it('빈 값은 색뿐 아니라 sr-only 텍스트로도 «없음» 을 알린다', () => {
    const w = mount(NDescriptionList, { props: { items } })
    const empty = w.findAll('dd')[2]
    expect(empty.classes()).toContain('n-description-list__value--empty')
    expect(empty.find('[aria-hidden="true"]').text()).toBe('—')
    expect(empty.find('.n-description-list__sr-only').text()).toBe('값 없음')
  })

  it('라벨 slug 로 값 슬롯을 덮어쓸 수 있다', () => {
    const w = mount(NDescriptionList, {
      props: { items },
      slots: { 'value-주문번호': '<a href="#">링크</a>' },
    })
    expect(w.findAll('dd')[0].find('a').text()).toBe('링크')
  })

  it('divider prop 이 구분선 modifier 를 붙인다', () => {
    const w = mount(NDescriptionList, { props: { items, divider: true } })
    expect(w.classes()).toContain('n-description-list--divided')
  })
})
