<template>
  <div class="n-data-table-wrap">
    <!-- Toolbar -->
    <div v-if="hasToolbar" class="n-data-table__toolbar">
      <div class="n-data-table__toolbar-left">
        <slot name="toolbar-left" :page="page" :page-size="pageSize" :total-items="totalItems">
          <span v-if="resolvedShowSummary" class="n-data-table__summary">
            {{ resolvedSummaryText }}
          </span>
        </slot>
      </div>
      <div class="n-data-table__toolbar-right">
        <!-- `toolbar` 는 구 API. `toolbar-right` 가 없을 때만 fallback 으로 렌더한다. -->
        <slot
          name="toolbar-right"
          :page="page"
          :page-size="pageSize"
          :total-items="totalItems"
          :selected-rows="selectedRows"
        >
          <slot name="toolbar" />
        </slot>
      </div>
    </div>

    <!-- 일괄 액션 바 (선택 행이 있을 때 노출하는 용도) -->
    <div v-if="slots['toolbar-bottom']" class="n-data-table__toolbar-bottom">
      <slot name="toolbar-bottom" :selected-rows="selectedRows" />
    </div>

    <!-- 에러는 표 자체를 대체한다. 빈 표 + 별도 배너로 두면
         「데이터가 0건」과 「조회 실패」가 시각적으로 구분되지 않는다. -->
    <NAsyncSection
      v-if="error"
      :error="error"
      :error-message="errorMessage"
      :retryable="retryable"
      @retry="emit('retry')"
    >
      <template #error="{ message }">
        <slot name="error" :message="message">
          <p class="n-data-table__error-message">{{ message }}</p>
          <NButton v-if="retryable" variant="danger" size="sm" @click="emit('retry')">
            다시 시도
          </NButton>
        </slot>
      </template>
    </NAsyncSection>

    <div v-else class="n-data-table-container">
      <table
        :class="['n-data-table', { 'n-data-table--single-line': singleLineRows }]"
        :aria-busy="loading || undefined"
      >
        <caption v-if="caption" class="n-sr-only">{{ caption }}</caption>
        <thead class="n-data-table__head">
          <tr>
            <th
              v-if="expandable"
              scope="col"
              class="n-data-table__th n-data-table__th--expand"
            >
              <span class="n-sr-only">펼치기</span>
            </th>
            <th
              v-if="selectable"
              scope="col"
              class="n-data-table__th n-data-table__th--checkbox"
            >
              <NCheckbox
                :model-value="isAllSelected"
                :indeterminate="isIndeterminate"
                aria-label="전체 선택"
                @update:model-value="toggleSelectAll"
              />
            </th>
            <th
              v-for="col in columns"
              :key="col.key"
              scope="col"
              :aria-sort="ariaSortFor(col)"
              :class="[
                'n-data-table__th',
                `n-data-table__th--case-${headerCase}`,
                { 'n-data-table__th--sortable': col.sortable },
                col.align ? `n-data-table__th--${col.align}` : '',
              ]"
              :style="col.width ? { width: col.width } : undefined"
            >
              <slot :name="`header-${col.key}`" :column="col">
                <!-- 정렬 헤더는 반드시 진짜 <button> 이어야 한다.
                     `<th @click>` 은 Tab 으로 도달할 수 없어 키보드만 쓰는 운영자는
                     정렬을 아예 할 수 없다 (WCAG 2.1.1). -->
                <button
                  v-if="col.sortable"
                  type="button"
                  class="n-data-table__sort-button"
                  @click="toggleSort(col.key)"
                >
                  <span>{{ col.label }}</span>
                  <span class="n-data-table__sort-icon" aria-hidden="true">
                    <svg
                      v-if="localSortKey === col.key && localSortOrder === 'asc'"
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                    >
                      <path d="M5 5.5L7 3.5L9 5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                      <path d="M5 8.5L7 10.5L9 8.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.3" />
                    </svg>
                    <svg
                      v-else-if="localSortKey === col.key && localSortOrder === 'desc'"
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                    >
                      <path d="M5 5.5L7 3.5L9 5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.3" />
                      <path d="M5 8.5L7 10.5L9 8.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    <svg v-else width="14" height="14" viewBox="0 0 14 14" fill="none" opacity="0.3">
                      <path d="M5 5.5L7 3.5L9 5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                      <path d="M5 8.5L7 10.5L9 8.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </span>
                </button>
                <span v-else class="n-data-table__th-content">{{ col.label }}</span>
              </slot>
            </th>
          </tr>
        </thead>

        <!-- 최초 로드: 실제 행/셀 구조로 스켈레톤을 그린다.
             td colspan 하나에 스켈레톤을 넣으면 컬럼 폭이 무너져 데이터가 도착하는 순간
             표가 통째로 다시 배치된다(레이아웃 시프트). -->
        <tbody v-if="loading && data.length === 0" class="n-data-table__body">
          <tr
            v-for="row in skeletonRowCount"
            :key="`skeleton-${row}`"
            class="n-data-table__row n-data-table__row--skeleton"
          >
            <td v-if="expandable" class="n-data-table__td n-data-table__td--expand" />
            <td v-if="selectable" class="n-data-table__td n-data-table__td--checkbox">
              <span class="n-data-table__skeleton-bar" style="width: 1.125rem" />
            </td>
            <td v-for="(col, colIndex) in columns" :key="col.key" class="n-data-table__td">
              <span
                class="n-data-table__skeleton-bar"
                :style="{ width: skeletonBarWidth(row, colIndex) }"
              />
            </td>
          </tr>
        </tbody>

        <tbody v-else class="n-data-table__body">
          <template v-if="data.length > 0">
            <template v-for="(row, rowIndex) in data" :key="rowKey ? row[rowKey] : rowIndex">
              <tr
                :class="[
                  'n-data-table__row',
                  { 'n-data-table__row--clickable': rowClickable },
                  { 'n-data-table__row--selected': selectable && isRowSelected(row) },
                  { 'n-data-table__row--expanded': isRowExpanded(row) },
                  rowClass ? rowClass(row, rowIndex) : '',
                ]"
                :tabindex="rowClickable ? 0 : undefined"
                :role="rowClickable ? 'button' : undefined"
                @click="onRowClick(row)"
                @keydown.enter.prevent="rowClickable ? onRowClick(row) : undefined"
                @keydown.space.prevent="rowClickable ? onRowClick(row) : undefined"
              >
                <td v-if="expandable" class="n-data-table__td n-data-table__td--expand" @click.stop>
                  <button
                    v-if="canExpand(row)"
                    type="button"
                    class="n-data-table__expand-button"
                    :aria-expanded="isRowExpanded(row)"
                    :aria-label="isRowExpanded(row) ? '접기' : '펼치기'"
                    @click="toggleExpand(row)"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      :class="['n-data-table__expand-icon', { 'is-open': isRowExpanded(row) }]"
                    >
                      <path d="M5 3l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </button>
                </td>
                <td
                  v-if="selectable"
                  class="n-data-table__td n-data-table__td--checkbox"
                  @click.stop
                >
                  <NCheckbox
                    :model-value="isRowSelected(row)"
                    :aria-label="`${rowIndex + 1}번째 행 선택`"
                    @update:model-value="toggleRowSelection(row, $event)"
                  />
                </td>
                <td
                  v-for="col in columns"
                  :key="col.key"
                  :class="[
                    'n-data-table__td',
                    col.align ? `n-data-table__td--${col.align}` : '',
                  ]"
                >
                  <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]" :index="rowIndex">
                    {{ row[col.key] }}
                  </slot>
                </td>
              </tr>
              <tr v-if="expandable && isRowExpanded(row)" class="n-data-table__expanded-row">
                <td :colspan="totalColspan">
                  <slot name="expanded-row" :row="row" :index="rowIndex" />
                </td>
              </tr>
            </template>
          </template>
          <tr v-else>
            <td :colspan="totalColspan" class="n-data-table__empty">
              <slot name="empty">
                <div class="n-data-table__empty-content">
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
                    <rect x="4" y="8" width="32" height="24" rx="3" stroke="currentColor" stroke-width="1.5" />
                    <path d="M4 16h32M16 16v16" stroke="currentColor" stroke-width="1.5" />
                  </svg>
                  <p>{{ emptyText }}</p>
                </div>
              </slot>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 데이터가 있는 상태의 재요청 — 표를 지우지 않고 오버레이만 덮는다.
           필터를 바꿀 때마다 표가 빈 화면으로 깜빡이면 "결과가 없다"로 오독된다. -->
      <div v-if="loading && data.length > 0" class="n-data-table__overlay" aria-hidden="true">
        <span class="n-data-table__spinner" />
      </div>
    </div>

    <!-- 표 아래 도메인 주석 (집계 기준·한계 고지 등) -->
    <div v-if="slots.note" class="n-data-table__note">
      <slot name="note" />
    </div>

    <!--
      푸터 노출 조건이 `totalPages > 1` 이면 안 된다.
      사용자가 페이지 크기를 100으로 올려 전체가 1페이지에 들어가는 순간 푸터가 통째로 사라져
      **페이지 크기를 되돌릴 UI 자체가 없어진다.** 행이 하나라도 있으면 항상 노출한다.
    -->
    <div v-if="pagination && totalItems > 0" class="n-data-table__footer">
      <slot
        name="footer"
        :page="page"
        :page-size="pageSize"
        :total-items="totalItems"
        :total-pages="totalPages"
      >
        <div class="n-data-table__footer-left">
          <template v-if="pageSizeOptions?.length">
            <select
              :value="pageSize"
              class="n-data-table__page-size-select"
              :aria-label="pageSizeLabel"
              @change="onPageSizeChange"
            >
              <option v-for="opt in pageSizeOptions" :key="opt" :value="opt">{{ opt }}</option>
            </select>
            <span class="n-data-table__page-size-label">{{ pageSizeLabel }}</span>
          </template>
          <span class="n-data-table__range">{{ rangeInfo }}</span>
        </div>
        <div class="n-data-table__footer-right">
          <NPagination
            :model-value="page"
            :total="totalItems"
            :per-page="pageSize"
            @update:model-value="emit('update:page', $event)"
          />
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type Slots, computed, onBeforeUnmount, ref, watch, useSlots } from 'vue'
import { NCheckbox } from '../NCheckbox'
import { NPagination } from '../NPagination'
import NButton from '../NButton/NButton.vue'
import NAsyncSection from '../NAsyncSection/NAsyncSection.vue'

export interface NDataTableColumn {
  key: string
  label: string
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
  width?: string
}

export interface NDataTableProps {
  columns: NDataTableColumn[]
  data: Record<string, any>[]
  rowKey?: string
  rowClickable?: boolean
  /** 행마다 추가 클래스를 붙인다 (master-detail 선택 하이라이트 등) */
  rowClass?: (row: Record<string, any>, index: number) => string | string[]
  /** 행 높이를 한 줄로 고정하고 넘치면 가로 스크롤 — 긴 텍스트가 섞여도 행 높이가 들쭉날쭉하지 않다 */
  singleLineRows?: boolean
  emptyText?: string
  /** 스크린리더용 표 설명 (시각적으로는 숨김) */
  caption?: string

  // 상태
  loading?: boolean
  /** truthy 면 표 대신 에러 박스를 렌더 */
  error?: unknown
  errorMessage?: string
  retryable?: boolean
  /** 최초 로드 스켈레톤 행 수. 미지정 시 pagination이면 pageSize, 아니면 5 */
  skeletonRows?: number

  // 정렬
  sortKey?: string
  sortOrder?: 'asc' | 'desc'
  /**
   * 헤더 클릭 후 `sort` 이벤트 발화까지의 디바운스(ms).
   *
   * ⭐ **기본값 0.** 디바운스는 refetch 를 아끼려는 것이지만, 실제로는
   * 「정렬을 눌렀는데 아무 반응이 없는」 상태를 만들어 사용자가 다시 누르게 한다.
   * 응답성이 서버 왕복 몇 번보다 중요하다. 왕복이 정말 비싼 목록에서만 명시적으로 올릴 것.
   * 시각적 정렬 표시(update:sortKey/sortOrder)는 디바운스와 무관하게 즉시 발화한다.
   */
  sortDebounceMs?: number

  // 페이지네이션
  pagination?: boolean
  page?: number
  pageSize?: number
  totalItems?: number
  pageSizeOptions?: number[]
  pageSizeLabel?: string

  // 선택
  selectable?: boolean
  selectedRows?: any[]

  // 펼침 행 (드로어)
  expandable?: boolean
  /**
   * 행별 펼침 가능 여부 (미전달 = 전부 가능).
   * 펼칠 내용이 없는데 화살표가 보이면 눌러도 빈 드로어만 열려 목록이 어수선해진다.
   */
  rowExpandable?: (row: Record<string, any>) => boolean
  /** 펼침 상태 제어(controlled). 미전달 시 내부 상태로 동작 */
  expandedKeys?: any[]

  // 툴바
  showSummary?: boolean | null
  /** `{start}` `{end}` `{count}` `{total}` 치환 */
  summaryText?: string

  // 헤더
  headerCase?: 'uppercase' | 'normal'
}

const props = withDefaults(defineProps<NDataTableProps>(), {
  rowKey: undefined,
  rowClickable: false,
  rowClass: undefined,
  singleLineRows: false,
  emptyText: '데이터가 없습니다',
  caption: undefined,
  loading: false,
  error: undefined,
  errorMessage: undefined,
  retryable: true,
  skeletonRows: undefined,
  sortKey: undefined,
  sortOrder: 'desc',
  sortDebounceMs: 0,
  pagination: false,
  page: 1,
  pageSize: 20,
  totalItems: 0,
  pageSizeOptions: undefined,
  pageSizeLabel: '개씩 보기',
  selectable: false,
  selectedRows: undefined,
  expandable: false,
  rowExpandable: undefined,
  expandedKeys: undefined,
  showSummary: null,
  summaryText: undefined,
  headerCase: 'normal',
})

const emit = defineEmits<{
  'row-click': [row: Record<string, any>]
  'update:page': [page: number]
  'update:pageSize': [size: number]
  'update:sortKey': [key: string]
  'update:sortOrder': [order: 'asc' | 'desc']
  sort: [payload: { key: string; order: 'asc' | 'desc' }]
  'update:selectedRows': [keys: any[]]
  select: [payload: { selected: any[]; row?: Record<string, any> }]
  'select-all': [payload: { selected: boolean; rows: Record<string, any>[] }]
  'update:expandedKeys': [keys: any[]]
  expand: [payload: { row: Record<string, any>; expanded: boolean }]
  retry: []
}>()

const slots: Slots = useSlots()

// ---- 최초 로드 스켈레톤 ----
// 행 수: 서버 페이징이면 pageSize 가 곧 기대 행 수, 아니면 소형 기본값
const skeletonRowCount = computed(
  () => props.skeletonRows ?? (props.pagination ? props.pageSize : 5),
)

// 바 폭: 인덱스 기반 결정적 변화. 랜덤을 쓰면 SSR 과 클라이언트 렌더가 달라져
// 하이드레이션 불일치 경고가 난다.
const SKELETON_BAR_WIDTHS = ['72%', '58%', '83%', '64%', '77%', '61%', '69%']
function skeletonBarWidth(row: number, col: number): string {
  return SKELETON_BAR_WIDTHS[(row * 3 + col) % SKELETON_BAR_WIDTHS.length]!
}

// ---- Computed ----

const totalPages = computed(() =>
  props.totalItems ? Math.ceil(props.totalItems / props.pageSize) : 0,
)

const totalColspan = computed(
  () => props.columns.length + (props.selectable ? 1 : 0) + (props.expandable ? 1 : 0),
)

const hasToolbar = computed(
  () =>
    !!slots.toolbar ||
    !!slots['toolbar-left'] ||
    !!slots['toolbar-right'] ||
    resolvedShowSummary.value,
)

const resolvedShowSummary = computed(() =>
  props.showSummary === null ? props.pagination && props.totalItems > 0 : props.showSummary,
)

const rangeStart = computed(() => (props.page - 1) * props.pageSize + 1)
const rangeEnd = computed(() => Math.min(props.page * props.pageSize, props.totalItems))

/** 우측 범위 정보 (예: 1–20 / 132) */
const rangeInfo = computed(() => {
  if (!props.totalItems) return ''
  return `${rangeStart.value}–${rangeEnd.value} / ${props.totalItems.toLocaleString()}`
})

const resolvedSummaryText = computed(() => {
  if (!props.totalItems) return ''
  const count = rangeEnd.value - rangeStart.value + 1
  const template = props.summaryText ?? '전체 {total}건 중 {start}–{end}'
  return template
    .replace('{start}', String(rangeStart.value))
    .replace('{end}', String(rangeEnd.value))
    .replace('{count}', String(count))
    .replace('{total}', props.totalItems.toLocaleString())
})

function ariaSortFor(col: NDataTableColumn) {
  if (!col.sortable) return undefined
  if (localSortKey.value !== col.key) return 'none' as const
  return localSortOrder.value === 'asc' ? ('ascending' as const) : ('descending' as const)
}

// ---- Row click ----
function onRowClick(row: Record<string, any>) {
  if (!props.rowClickable) return
  emit('row-click', row)
}

// ---- Selection ----
function getRowKeyValue(row: Record<string, any>) {
  return props.rowKey ? row[props.rowKey] : props.data.indexOf(row)
}

function isRowSelected(row: Record<string, any>): boolean {
  const key = getRowKeyValue(row)
  return (props.selectedRows ?? []).includes(key)
}

const isAllSelected = computed(() => {
  if (!props.data.length) return false
  return props.data.every((row) => isRowSelected(row))
})

const isIndeterminate = computed(() => {
  if (!props.data.length) return false
  const someSelected = props.data.some((row) => isRowSelected(row))
  return someSelected && !isAllSelected.value
})

function toggleRowSelection(row: Record<string, any>, selected: boolean) {
  const key = getRowKeyValue(row)
  const current = [...(props.selectedRows ?? [])]
  if (selected) {
    if (!current.includes(key)) current.push(key)
  } else {
    const idx = current.indexOf(key)
    if (idx >= 0) current.splice(idx, 1)
  }
  emit('update:selectedRows', current)
  emit('select', { selected: current, row })
}

function toggleSelectAll(selected: boolean) {
  const next = selected ? props.data.map((row) => getRowKeyValue(row)) : []
  emit('update:selectedRows', next)
  emit('select-all', { selected, rows: props.data })
}

// ---- Expand ----
const internalExpandedKeys = ref<any[]>([])

// controlled(expandedKeys 전달) / uncontrolled(내부 상태) 이중 모드
const activeExpandedKeys = computed(() => props.expandedKeys ?? internalExpandedKeys.value)

function canExpand(row: Record<string, any>) {
  return props.rowExpandable ? props.rowExpandable(row) : true
}

function isRowExpanded(row: Record<string, any>) {
  return activeExpandedKeys.value.includes(getRowKeyValue(row))
}

function toggleExpand(row: Record<string, any>) {
  const key = getRowKeyValue(row)
  const current = [...activeExpandedKeys.value]
  const idx = current.indexOf(key)
  const expanded = idx < 0
  if (expanded) current.push(key)
  else current.splice(idx, 1)

  if (props.expandedKeys === undefined) internalExpandedKeys.value = current
  emit('update:expandedKeys', current)
  emit('expand', { row, expanded })
}

// ---- Pagination ----
function onPageSizeChange(event: Event) {
  emit('update:pageSize', Number((event.target as HTMLSelectElement).value))
}

// ---- Sort ----
// 로컬 상태를 두는 이유: 정렬을 100% 외부 controlled 로 두면
// `sort` emit → 상위 라우트 갱신 → props 재하강 까지 화살표가 움직이지 않아
// 사용자에게는 "안 눌렸다"로 보인다.
const localSortKey = ref(props.sortKey)
const localSortOrder = ref<'asc' | 'desc'>(props.sortOrder)

watch(
  () => props.sortKey,
  (v) => {
    localSortKey.value = v
  },
)
watch(
  () => props.sortOrder,
  (v) => {
    localSortOrder.value = v
  },
)

let sortTimer: ReturnType<typeof setTimeout> | null = null

onBeforeUnmount(() => {
  if (sortTimer) {
    clearTimeout(sortTimer)
    sortTimer = null
  }
})

function toggleSort(key: string) {
  let order: 'asc' | 'desc' = 'asc'
  if (localSortKey.value === key) {
    order = localSortOrder.value === 'asc' ? 'desc' : 'asc'
  }

  // 즉시 local state 갱신 → 화살표 아이콘이 클릭과 동시에 반응
  localSortKey.value = key
  localSortOrder.value = order

  emit('update:sortKey', key)
  emit('update:sortOrder', order)

  const delay = props.sortDebounceMs
  if (delay > 0) {
    if (sortTimer) clearTimeout(sortTimer)
    sortTimer = setTimeout(() => {
      sortTimer = null
      emit('sort', { key, order })
    }, delay)
  } else {
    emit('sort', { key, order })
  }
}
</script>

<style scoped>
.n-data-table-wrap {
  border: var(--n-border-width-1, 1px) solid var(--n-table-border-color, var(--n-color-neutral-200, #e5e5e5));
  border-radius: var(--n-table-border-radius, var(--n-radius-xl, 0.75rem));
  background-color: var(--n-color-white, #ffffff);
  font-family: var(--n-font-family-sans, 'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Segoe UI', 'Noto Sans KR', sans-serif);
  overflow: hidden;
}

.n-data-table__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--n-table-toolbar-gap, 0.75rem);
  padding: var(--n-table-toolbar-padding-y, 1rem) var(--n-table-row-padding-x, 1.25rem);
  border-bottom: var(--n-border-width-1, 1px) solid var(--n-color-neutral-100, #f5f5f5);
}

.n-data-table__toolbar-left,
.n-data-table__toolbar-right {
  display: flex;
  align-items: center;
  gap: var(--n-spacing-2, 0.5rem);
}

.n-data-table__toolbar-bottom {
  display: flex;
  align-items: center;
  gap: var(--n-spacing-2, 0.5rem);
  padding: var(--n-spacing-3, 0.75rem) var(--n-table-row-padding-x, 1.25rem);
  background-color: var(--n-color-primary-50, #f1edff);
  border-bottom: var(--n-border-width-1, 1px) solid var(--n-color-neutral-100, #f5f5f5);
}

.n-data-table__summary {
  font-size: var(--n-font-size-sm, 0.875rem);
  color: var(--n-color-neutral-500, #737373);
}

.n-data-table-container {
  position: relative;
  overflow-x: auto;
}

.n-data-table {
  width: 100%;
  border-collapse: collapse;
}

.n-data-table--single-line .n-data-table__td {
  white-space: nowrap;
}

.n-data-table__head {
  background-color: var(--n-table-header-bg, var(--n-color-neutral-50, #fafafa));
  border-bottom: var(--n-border-width-1, 1px) solid var(--n-table-border-color, var(--n-color-neutral-200, #e5e5e5));
}

.n-data-table__th {
  padding: var(--n-table-row-padding-y, 0.75rem) var(--n-table-row-padding-x, 1.25rem);
  font-size: var(--n-table-header-font-size, var(--n-font-size-sm, 0.875rem));
  font-weight: var(--n-table-header-font-weight, var(--n-font-weight-semibold, 600));
  color: var(--n-table-header-text, var(--n-color-neutral-500, #737373));
  text-align: left;
  white-space: nowrap;
}

.n-data-table__th--case-uppercase {
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.n-data-table__th--center { text-align: center; }
.n-data-table__th--right { text-align: right; }
.n-data-table__th--checkbox { width: var(--n-table-checkbox-col-width, 3rem); }
.n-data-table__th--expand { width: 2.5rem; }

.n-data-table__th-content {
  display: inline-flex;
  align-items: center;
  gap: var(--n-spacing-1, 0.25rem);
}

/* 정렬 버튼은 헤더 셀 전체를 채우되 시각적으로는 텍스트처럼 보이게 한다.
   (버튼처럼 보일 필요는 없지만 «버튼이어야» 한다) */
.n-data-table__sort-button {
  display: inline-flex;
  align-items: center;
  gap: var(--n-spacing-1, 0.25rem);
  padding: 0;
  margin: 0;
  border: none;
  background: none;
  font: inherit;
  color: inherit;
  cursor: pointer;
  user-select: none;
}

.n-data-table__sort-button:hover {
  color: var(--n-color-neutral-800, #262626);
}

.n-data-table__th--right .n-data-table__sort-button { flex-direction: row; }

.n-data-table__sort-icon {
  display: inline-flex;
  align-items: center;
}

.n-data-table__td {
  padding: var(--n-table-row-padding-y, 0.75rem) var(--n-table-row-padding-x, 1.25rem);
  font-size: var(--n-table-cell-font-size, var(--n-font-size-sm, 0.875rem));
  color: var(--n-color-neutral-800, #262626);
  border-bottom: var(--n-border-width-1, 1px) solid var(--n-color-neutral-100, #f5f5f5);
}

.n-data-table__td--center { text-align: center; }
.n-data-table__td--right { text-align: right; }
.n-data-table__td--checkbox { width: var(--n-table-checkbox-col-width, 3rem); }
.n-data-table__td--expand { width: 2.5rem; }

.n-data-table__row:last-child .n-data-table__td {
  border-bottom: none;
}

.n-data-table__row--clickable {
  cursor: pointer;
}

.n-data-table__row--clickable:hover {
  background-color: var(--n-table-row-hover-bg, var(--n-color-neutral-50, #fafafa));
}

.n-data-table__row--selected {
  background-color: var(--n-table-row-selected-bg, var(--n-color-primary-50, #f1edff));
}

/* 행 포커스는 표 안에서 «지금 여기» 를 알려주는 유일한 단서라 링을 안쪽으로 넣는다
   (outline-offset 양수면 인접 행에 가려 잘린다) */
.n-data-table__row--clickable:focus-visible {
  outline: 2px solid var(--n-color-primary-500, #6239ff);
  outline-offset: -2px;
}

.n-data-table__expand-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  padding: 0;
  border: none;
  border-radius: var(--n-radius-sm, 0.25rem);
  background: none;
  color: var(--n-color-neutral-500, #737373);
  cursor: pointer;
}

.n-data-table__expand-button:hover {
  background-color: var(--n-color-neutral-100, #f5f5f5);
}

.n-data-table__expand-icon {
  transition: transform var(--n-transition-fast, 150ms ease);
}

.n-data-table__expand-icon.is-open {
  transform: rotate(90deg);
}

.n-data-table__expanded-row > td {
  padding: var(--n-spacing-4, 1rem) var(--n-table-row-padding-x, 1.25rem);
  background-color: var(--n-color-neutral-50, #fafafa);
  border-bottom: var(--n-border-width-1, 1px) solid var(--n-color-neutral-100, #f5f5f5);
}

.n-data-table__skeleton-bar {
  display: block;
  height: 0.875rem;
  border-radius: var(--n-skeleton-border-radius, var(--n-radius-md, 0.375rem));
  background: linear-gradient(
    90deg,
    var(--n-color-neutral-100, #f5f5f5) 25%,
    var(--n-color-neutral-200, #e5e5e5) 50%,
    var(--n-color-neutral-100, #f5f5f5) 75%
  );
  background-size: 200% 100%;
  animation: n-data-table-pulse 1.5s ease-in-out infinite;
}

@keyframes n-data-table-pulse {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.n-data-table__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: var(--n-spacing-10, 2.5rem);
  background: rgba(255, 255, 255, 0.6);
  pointer-events: none;
  z-index: 1;
}

.n-data-table__spinner {
  width: 1.375rem;
  height: 1.375rem;
  border-radius: var(--n-radius-full, 9999px);
  border: 2.5px solid var(--n-color-neutral-300, #d4d4d4);
  border-top-color: var(--n-color-primary-500, #6239ff);
  animation: n-data-table-spin 0.7s linear infinite;
}

@keyframes n-data-table-spin {
  to { transform: rotate(360deg); }
}

/* 전역 reduced-motion 가드가 0.01ms 로 낮추면 멈춘 것처럼 보인다.
   회전은 «상태 표시»라 없애지 않고 느리게만 돌린다. */
@media (prefers-reduced-motion: reduce) {
  .n-data-table__spinner {
    animation-duration: 1.6s !important;
  }
}

.n-data-table__empty {
  text-align: center;
  padding: var(--n-spacing-10, 2.5rem) var(--n-spacing-4, 1rem);
}

.n-data-table__empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--n-spacing-3, 0.75rem);
  color: var(--n-color-neutral-400, #a3a3a3);
}

.n-data-table__empty-content p {
  margin: 0;
  font-size: var(--n-font-size-sm, 0.875rem);
}

.n-data-table__error-message {
  margin: 0;
  font-size: var(--n-font-size-sm, 0.875rem);
  color: var(--n-color-error-600, #dc2626);
}

.n-data-table__note {
  padding: var(--n-spacing-3, 0.75rem) var(--n-table-row-padding-x, 1.25rem);
  border-top: var(--n-border-width-1, 1px) solid var(--n-color-neutral-100, #f5f5f5);
  font-size: var(--n-font-size-xs, 0.75rem);
  color: var(--n-color-neutral-500, #737373);
}

.n-data-table__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--n-spacing-3, 0.75rem);
  padding: var(--n-spacing-3, 0.75rem) var(--n-table-row-padding-x, 1.25rem);
  border-top: var(--n-border-width-1, 1px) solid var(--n-table-border-color, var(--n-color-neutral-200, #e5e5e5));
}

.n-data-table__footer-left {
  display: flex;
  align-items: center;
  gap: var(--n-spacing-2, 0.5rem);
}

.n-data-table__footer-right {
  display: flex;
  align-items: center;
}

.n-data-table__page-size-label,
.n-data-table__range {
  font-size: var(--n-font-size-sm, 0.875rem);
  color: var(--n-color-neutral-500, #737373);
}

.n-data-table__page-size-select {
  padding: var(--n-spacing-1, 0.25rem) var(--n-spacing-2, 0.5rem);
  border: var(--n-border-width-1, 1px) solid var(--n-color-neutral-300, #d4d4d4);
  border-radius: var(--n-radius-md, 0.375rem);
  font-size: var(--n-font-size-sm, 0.875rem);
  font-family: inherit;
  background-color: var(--n-color-white, #ffffff);
  color: var(--n-color-neutral-700, #404040);
}
</style>
