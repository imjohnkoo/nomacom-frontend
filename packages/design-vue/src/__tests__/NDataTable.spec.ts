import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import NDataTable from '../components/NDataTable/NDataTable.vue'
import type { NDataTableColumn } from '../components/NDataTable/NDataTable.vue'

const columns: NDataTableColumn[] = [
  { key: 'name', label: '이름', sortable: true },
  { key: 'email', label: '이메일' },
]

const data = [
  { id: 1, name: '김철수', email: 'a@example.com' },
  { id: 2, name: '이영희', email: 'b@example.com' },
]

function mountTable(props: Record<string, unknown> = {}) {
  return mount(NDataTable, {
    props: { columns, data, rowKey: 'id', ...props },
  })
}

describe('NDataTable — 접근성', () => {
  it('모든 헤더 셀에 scope="col" 이 있다', () => {
    const ths = mountTable().findAll('th')
    expect(ths.length).toBeGreaterThan(0)
    for (const th of ths) {
      expect(th.attributes('scope')).toBe('col')
    }
  })

  it('정렬 가능한 헤더는 실제 <button> 이라 키보드로 도달할 수 있다', () => {
    const wrapper = mountTable()
    const sortButton = wrapper.find('.n-data-table__sort-button')
    expect(sortButton.exists()).toBe(true)
    expect(sortButton.element.tagName).toBe('BUTTON')
  })

  it('정렬 불가 컬럼에는 정렬 버튼이 없다', () => {
    const wrapper = mountTable()
    expect(wrapper.findAll('.n-data-table__sort-button')).toHaveLength(1)
  })

  it('aria-sort 가 정렬 상태를 반영한다', async () => {
    const wrapper = mountTable({ sortKey: 'name', sortOrder: 'asc' })
    const [sortableTh] = wrapper.findAll('th')
    expect(sortableTh.attributes('aria-sort')).toBe('ascending')

    await wrapper.setProps({ sortOrder: 'desc' })
    expect(wrapper.findAll('th')[0].attributes('aria-sort')).toBe('descending')
  })

  it('정렬되지 않은 정렬가능 컬럼은 aria-sort="none"', () => {
    const wrapper = mountTable({ sortKey: 'email' })
    expect(wrapper.findAll('th')[0].attributes('aria-sort')).toBe('none')
  })

  it('클릭 가능한 행은 키보드로 진입할 수 있다 (tabindex + Enter/Space)', async () => {
    const wrapper = mountTable({ rowClickable: true })
    const row = wrapper.find('.n-data-table__row')
    expect(row.attributes('tabindex')).toBe('0')
    expect(row.attributes('role')).toBe('button')

    await row.trigger('keydown.enter')
    expect(wrapper.emitted('row-click')).toHaveLength(1)

    await row.trigger('keydown.space')
    expect(wrapper.emitted('row-click')).toHaveLength(2)
  })

  it('클릭 불가 행에는 tabindex/role 을 붙이지 않는다', () => {
    const row = mountTable().find('.n-data-table__row')
    expect(row.attributes('tabindex')).toBeUndefined()
    expect(row.attributes('role')).toBeUndefined()
  })

  it('caption 은 스크린리더 전용으로 렌더된다', () => {
    const wrapper = mountTable({ caption: '사용자 목록' })
    const caption = wrapper.find('caption')
    expect(caption.exists()).toBe(true)
    expect(caption.classes()).toContain('n-sr-only')
  })
})

describe('NDataTable — 정렬 상태', () => {
  it('헤더 클릭 시 화살표가 즉시 반응한다 (외부 props 왕복을 기다리지 않음)', async () => {
    // 회귀 방지: 정렬 상태를 100% controlled 로 두면 sort emit → 라우트 갱신 →
    // props 재하강 까지 화살표가 멈춰 있어 "안 눌렸다"로 보인다.
    const wrapper = mountTable({ sortKey: undefined })
    await wrapper.find('.n-data-table__sort-button').trigger('click')
    await nextTick()
    expect(wrapper.findAll('th')[0].attributes('aria-sort')).toBe('ascending')
  })

  it('update:sortKey / update:sortOrder / sort 를 모두 발화한다', async () => {
    const wrapper = mountTable()
    await wrapper.find('.n-data-table__sort-button').trigger('click')
    expect(wrapper.emitted('update:sortKey')?.[0]).toEqual(['name'])
    expect(wrapper.emitted('update:sortOrder')?.[0]).toEqual(['asc'])
    expect(wrapper.emitted('sort')?.[0]).toEqual([{ key: 'name', order: 'asc' }])
  })

  it('같은 컬럼을 다시 누르면 방향이 토글된다', async () => {
    const wrapper = mountTable({ sortKey: 'name', sortOrder: 'asc' })
    await wrapper.find('.n-data-table__sort-button').trigger('click')
    expect(wrapper.emitted('sort')?.[0]).toEqual([{ key: 'name', order: 'desc' }])
  })
})

describe('NDataTable — 페이지네이션 푸터', () => {
  it('전체가 1페이지에 들어가도 푸터가 남는다', () => {
    // 회귀 방지: 조건이 `totalPages > 1` 이면 페이지 크기를 키워 1페이지가 되는 순간
    // 푸터가 통째로 사라져 페이지 크기를 되돌릴 UI 자체가 없어진다.
    const wrapper = mountTable({
      pagination: true,
      totalItems: 2,
      pageSize: 100,
      pageSizeOptions: [20, 50, 100],
    })
    expect(wrapper.find('.n-data-table__footer').exists()).toBe(true)
    expect(wrapper.find('.n-data-table__page-size-select').exists()).toBe(true)
  })

  it('행이 0건이면 푸터를 감춘다', () => {
    const wrapper = mountTable({ data: [], pagination: true, totalItems: 0 })
    expect(wrapper.find('.n-data-table__footer').exists()).toBe(false)
  })

  it('범위 정보를 표시한다', () => {
    const wrapper = mountTable({
      pagination: true,
      totalItems: 132,
      pageSize: 20,
      page: 1,
      pageSizeOptions: [20],
    })
    expect(wrapper.find('.n-data-table__range').text()).toBe('1–20 / 132')
  })
})

describe('NDataTable — 로딩 상태', () => {
  it('최초 로드 시 실제 컬럼 수만큼 스켈레톤 셀을 그린다', () => {
    // 회귀 방지: td colspan 하나에 스켈레톤을 넣으면 컬럼 폭이 무너져
    // 데이터 도착 순간 표가 통째로 재배치된다.
    const wrapper = mountTable({ data: [], loading: true, skeletonRows: 3 })
    const skeletonRows = wrapper.findAll('.n-data-table__row--skeleton')
    expect(skeletonRows).toHaveLength(3)
    expect(skeletonRows[0].findAll('td')).toHaveLength(columns.length)
  })

  it('데이터가 있는 갱신은 표를 지우지 않고 오버레이만 덮는다', () => {
    const wrapper = mountTable({ loading: true })
    expect(wrapper.findAll('.n-data-table__row--skeleton')).toHaveLength(0)
    expect(wrapper.find('.n-data-table__overlay').exists()).toBe(true)
    expect(wrapper.text()).toContain('김철수')
  })

  it('스켈레톤 바 폭은 결정적이라 SSR 하이드레이션이 어긋나지 않는다', () => {
    const first = mountTable({ data: [], loading: true, skeletonRows: 3 })
    const second = mountTable({ data: [], loading: true, skeletonRows: 3 })
    expect(first.html()).toBe(second.html())
  })
})

describe('NDataTable — 에러 상태', () => {
  it('에러가 있으면 표 대신 에러 박스를 렌더한다', () => {
    const wrapper = mountTable({ error: new Error('boom'), errorMessage: '불러오지 못했습니다' })
    expect(wrapper.find('table').exists()).toBe(false)
    expect(wrapper.text()).toContain('불러오지 못했습니다')
  })

  it('다시 시도 버튼이 retry 를 발화한다', async () => {
    const wrapper = mountTable({ error: new Error('boom'), retryable: true })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('retry')).toBeTruthy()
  })

  it('조회 실패를 빈 상태로 위장하지 않는다', () => {
    const wrapper = mountTable({ data: [], error: new Error('boom') })
    expect(wrapper.text()).not.toContain('데이터가 없습니다')
  })
})

describe('NDataTable — 펼침 행', () => {
  it('rowExpandable 이 false 인 행에는 토글이 없다', () => {
    const wrapper = mountTable({
      expandable: true,
      rowExpandable: (row: Record<string, any>) => row.id === 1,
    })
    expect(wrapper.findAll('.n-data-table__expand-button')).toHaveLength(1)
  })

  it('토글이 aria-expanded 를 반영하고 expand 를 발화한다', async () => {
    const wrapper = mountTable({ expandable: true })
    const toggle = wrapper.find('.n-data-table__expand-button')
    expect(toggle.attributes('aria-expanded')).toBe('false')

    await toggle.trigger('click')
    expect(wrapper.emitted('expand')?.[0]).toEqual([
      { row: data[0], expanded: true },
    ])
    expect(wrapper.find('.n-data-table__expand-button').attributes('aria-expanded')).toBe('true')
  })
})

describe('NDataTable — 선택', () => {
  it('전체 선택 체크박스에 접근 가능한 이름이 있다', () => {
    const wrapper = mountTable({ selectable: true })
    expect(wrapper.html()).toContain('전체 선택')
  })

  it('select-all 이 선택 상태와 대상 행을 함께 넘긴다', async () => {
    // NCheckbox 는 reka-ui CheckboxRoot 기반이라 네이티브 input 이 아니라
    // role="checkbox" 인 버튼으로 렌더된다.
    const wrapper = mountTable({ selectable: true, selectedRows: [] })
    await wrapper.findAll('[role="checkbox"]')[0].trigger('click')
    const payload = wrapper.emitted('select-all')?.[0]?.[0] as
      | { selected: boolean; rows: unknown[] }
      | undefined
    expect(payload?.selected).toBe(true)
    expect(payload?.rows).toHaveLength(2)
  })
})
