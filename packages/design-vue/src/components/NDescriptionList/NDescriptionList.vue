<template>
  <dl :class="listClasses">
    <div
      v-for="(item, index) in items"
      :key="index"
      class="n-description-list__item"
    >
      <dt class="n-description-list__label">{{ item.label }}</dt>
      <dd
        :class="[
          'n-description-list__value',
          { 'n-description-list__value--empty': !hasValue(item) },
        ]"
      >
        <slot
          :name="`value-${slugify(item.label)}`"
          :item="item"
          :index="index"
        >
          <template v-if="hasValue(item)">{{ item.value }}</template>
          <!--
            빈 값의 «비어 있음» 을 흐린 색 하나로만 알리지 않는다.
            em dash 는 낭독하면 의미가 없으므로 감추고, sr-only 로 상태를 말해준다.
          -->
          <template v-else>
            <span aria-hidden="true">—</span>
            <span class="n-description-list__sr-only">값 없음</span>
          </template>
        </slot>
      </dd>
    </div>
  </dl>
</template>

<script setup lang="ts">
/*
 * <dl>/<dt>/<dd> 시맨틱을 그대로 쓴다 — div 로 흉내내면 스크린리더가 «용어–설명» 쌍을
 * 묶어 읽지 못하고 라벨과 값이 별개 텍스트로 흩어진다.
 * dt/dd 를 감싸는 <div> 는 HTML5 에서 <dl> 의 합법적인 그룹 래퍼다 (그리드 셀 용도).
 *
 * ⚠️ 이 설명을 템플릿 최상단 주석으로 두면 주석도 루트 노드로 세어져 컴포넌트가 fragment 가
 *    되고, class fallthrough 가 <dl> 에 붙지 않는다 (루트가 DIV 로 잡힌다). 그래서 script 에 둔다.
 */
import { computed } from 'vue'

export interface DescriptionItem {
  label: string
  value?: string | number | null
}

export interface NDescriptionListProps {
  /** 라벨–값 쌍 목록 */
  items: DescriptionItem[]
  /** 그리드 열 수 (반응형 — 모바일에서 1열로 접힌다) */
  columns?: 1 | 2 | 3
  /** 행 사이 구분선 — 값이 길어 행 경계가 흐려지는 상세 패널용 */
  divider?: boolean
}

const props = withDefaults(defineProps<NDescriptionListProps>(), {
  columns: 2,
  divider: false,
})

const listClasses = computed(() => [
  'n-description-list',
  `n-description-list--cols-${props.columns}`,
  { 'n-description-list--divided': props.divider },
])

function hasValue(item: DescriptionItem): boolean {
  return item.value !== undefined && item.value !== null && item.value !== ''
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-|-$/g, '')
}
</script>

<style scoped>
/* NDescriptionList — 라벨–값 정보 그리드 */

.n-description-list {
  display: grid;
  gap: var(--n-description-list-row-gap, 0.75rem) var(--n-description-list-column-gap, 1.5rem);
  margin: 0;
  padding: 0;
}

/* 열 변형 */
.n-description-list--cols-1 {
  grid-template-columns: 1fr;
}

.n-description-list--cols-2 {
  grid-template-columns: repeat(2, 1fr);
}

.n-description-list--cols-3 {
  grid-template-columns: repeat(3, 1fr);
}

/* 항목 */
.n-description-list__item {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* 라벨 (dt) */
.n-description-list__label {
  font-size: var(--n-description-list-label-font-size, var(--n-font-size-sm, 0.875rem));
  font-weight: var(--n-description-list-label-font-weight, var(--n-font-weight-medium, 500));
  color: var(--n-description-list-label-color, var(--n-color-neutral-500, #737373));
  line-height: var(--n-font-line-height-normal, 1.5);
}

/* 값 (dd) */
.n-description-list__value {
  margin: 0;
  margin-top: 0.125rem;
  font-size: var(--n-description-list-value-font-size, var(--n-font-size-sm, 0.875rem));
  font-weight: var(--n-font-weight-semibold, 600);
  color: var(--n-description-list-value-color, var(--n-color-neutral-900, #171717));
  line-height: var(--n-font-line-height-normal, 1.5);
  word-break: break-word;
}

.n-description-list__value--empty {
  font-weight: var(--n-font-weight-normal, 400);
  color: var(--n-color-neutral-400, #a3a3a3);
}

/* ── 구분선 ──
   ⚠️ 마지막 «행» 만 선을 빼는 건 그리드에서 :last-child 로 표현되지 않는다 (열이 여러 개면
   마지막 행에 여러 항목이 있다). 그래서 선을 항목의 **위쪽**에 그리고, 열 수만큼의
   첫 행 항목에서만 :nth-child(-n + N) 으로 걷어낸다 — 열 수가 바뀌어도 규칙이 따라온다. */
.n-description-list--divided .n-description-list__item {
  border-top: var(--n-border-width-1, 1px) solid var(--n-description-list-divider-color, var(--n-color-neutral-100, #f5f5f5));
  padding-top: var(--n-description-list-row-gap, 0.75rem);
}

.n-description-list--divided.n-description-list--cols-1 .n-description-list__item:nth-child(-n + 1),
.n-description-list--divided.n-description-list--cols-2 .n-description-list__item:nth-child(-n + 2),
.n-description-list--divided.n-description-list--cols-3 .n-description-list__item:nth-child(-n + 3) {
  border-top: none;
  padding-top: 0;
}

/* 반응형: 작은 화면에서 1열로 접힌다 (--n-breakpoint-sm = 640px.
   미디어 쿼리는 var() 를 못 쓰므로 값이 리터럴이다 — 토큰이 바뀌면 여기도 함께 고쳐야 한다) */
@media (max-width: 640px) {
  .n-description-list--cols-2,
  .n-description-list--cols-3 {
    grid-template-columns: 1fr;
  }

  /* 1열로 접히면 «첫 행» 도 항목 1개다 — 위에서 걷어낸 2·3번째 항목의 선을 되살린다 */
  .n-description-list--divided.n-description-list--cols-2 .n-description-list__item:nth-child(-n + 2),
  .n-description-list--divided.n-description-list--cols-3 .n-description-list__item:nth-child(-n + 3) {
    border-top: var(--n-border-width-1, 1px) solid var(--n-description-list-divider-color, var(--n-color-neutral-100, #f5f5f5));
    padding-top: var(--n-description-list-row-gap, 0.75rem);
  }

  .n-description-list--divided .n-description-list__item:first-child {
    border-top: none;
    padding-top: 0;
  }
}

.n-description-list__sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
