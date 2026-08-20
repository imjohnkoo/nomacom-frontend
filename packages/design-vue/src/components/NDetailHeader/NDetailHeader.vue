<template>
  <header class="n-detail-header" :class="{ 'n-detail-header--with-avatar': hasAvatar }">
    <!-- 아바타 (avatarText 또는 #avatar) — 있으면 가로 배치로 전환 -->
    <div v-if="hasAvatar" class="n-detail-header__avatar">
      <slot name="avatar">{{ avatarText }}</slot>
    </div>

    <div class="n-detail-header__body">
      <div class="n-detail-header__row">
        <component :is="titleTag" class="n-detail-header__title">{{ title }}</component>
        <slot name="badges" />
        <div v-if="$slots.aside" class="n-detail-header__aside">
          <slot name="aside" />
        </div>
      </div>

      <div v-if="meta?.length || $slots.meta" class="n-detail-header__meta">
        <slot name="meta">
          <template v-for="(m, i) in meta" :key="m.label">
            <span v-if="i > 0" class="n-detail-header__sep" aria-hidden="true">·</span>
            <span class="n-detail-header__meta-item">
              <span class="n-detail-header__meta-label">{{ m.label }}</span>
              <code v-if="m.mono" class="n-detail-header__mono">{{ m.value }}</code>
              <template v-else>{{ m.value }}</template>
              <span
                v-if="m.locked"
                class="n-detail-header__lock"
                role="img"
                :aria-label="lockedLabel"
                :title="lockedLabel"
              >
                🔒
              </span>
            </span>
          </template>
        </slot>
      </div>

      <slot name="extra" />

      <NKpiStrip v-if="$slots.kpis" border-top class="n-detail-header__kpis">
        <slot name="kpis" />
      </NKpiStrip>
    </div>
  </header>
</template>

<script setup lang="ts">
// 상세 페이지 헤더 카드 — (아바타) + 타이틀 + 상태 뱃지 + 우측 칩 + 메타 라인 + KPI 스트립.
// admin 상세 페이지들의 중복 헤더(scoped CSS 쌍둥이)를 표준화한 것.
import { computed, useSlots } from 'vue'
import NKpiStrip from '../NKpiStrip/NKpiStrip.vue'

export interface NDetailHeaderMeta {
  label: string
  value: string | number
  /** 코드/ID 류 — 모노스페이스로 렌더 */
  mono?: boolean
  /** 시스템 값 표시(🔒 + 툴팁) */
  locked?: boolean
}

export interface NDetailHeaderProps {
  title: string
  /** 타이틀 아래 메타 라인 — · 구분으로 나열. 자유 마크업은 #meta 슬롯 사용 */
  meta?: NDetailHeaderMeta[]
  /** 좌측 이니셜 아바타 텍스트 (1~2자 권장). 커스텀 마크업은 #avatar 슬롯 */
  avatarText?: string
  /**
   * 타이틀 헤딩 레벨. 기본 h1 — 한 페이지에 헤더가 둘 이상이거나 이미 h1 이 있으면
   * h2/h3 로 낮춰 헤딩 순서가 끊기지 않게 한다.
   */
  titleTag?: 'h1' | 'h2' | 'h3'
  /** locked 메타의 자물쇠 아이콘 낭독/툴팁 문구 */
  lockedLabel?: string
}

const props = withDefaults(defineProps<NDetailHeaderProps>(), {
  meta: undefined,
  avatarText: undefined,
  titleTag: 'h1',
  lockedLabel: '시스템 값 — 수정 불가',
})

const slots = useSlots()

const hasAvatar = computed(() => Boolean(props.avatarText || slots.avatar))
</script>

<style scoped>
/* NDetailHeader — 상세 페이지 헤더 카드 */

.n-detail-header {
  display: flex;
  flex-direction: column;
  /* 루트의 자식은 [아바타] + body 뿐이라 이 gap 은 사실상 아바타 ↔ 본문 간격이다 */
  gap: var(--n-detail-header-gap, 1rem);
  padding: var(--n-detail-header-padding, 1.25rem 1.5rem);
  background: var(--n-detail-header-bg, var(--n-color-white, #ffffff));
  border: var(--n-border-width-1, 1px) solid
    var(--n-detail-header-border-color, var(--n-color-neutral-200, #e5e5e5));
  border-radius: var(--n-detail-header-border-radius, var(--n-radius-xl, 0.75rem));
  font-family: var(--n-font-family-sans, 'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Segoe UI', 'Noto Sans KR', sans-serif);
}

/* 아바타가 있으면 가로 배치 (avatar | body) */
.n-detail-header--with-avatar {
  flex-direction: row;
  align-items: center;
}

.n-detail-header__avatar {
  width: var(--n-detail-header-avatar-size, 3rem);
  height: var(--n-detail-header-avatar-size, 3rem);
  flex: none;
  border-radius: var(--n-radius-2xl, 1rem);
  background: var(--n-detail-header-avatar-bg, var(--n-color-primary-100, #e3dbff));
  color: var(--n-detail-header-avatar-color, var(--n-color-primary-700, #3f1cc0));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--n-font-size-xl, 1.25rem);
  font-weight: var(--n-font-weight-bold, 700);
  border: var(--n-border-width-1, 1px) solid rgb(0 0 0 / 0.06);
  overflow: hidden;
}

.n-detail-header__body {
  display: flex;
  flex-direction: column;
  gap: var(--n-spacing-2, 0.5rem);
  min-width: 0;
  flex: 1;
}

.n-detail-header__row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--n-spacing-2, 0.5rem);
}

.n-detail-header__title {
  margin: 0;
  font-size: var(--n-detail-header-title-font-size, var(--n-font-size-2xl, 1.5rem));
  font-weight: var(--n-detail-header-title-font-weight, var(--n-font-weight-bold, 700));
  letter-spacing: -0.02em;
  line-height: 1.2;
  color: var(--n-color-neutral-900, #171717);
}

.n-detail-header__aside {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: var(--n-spacing-2, 0.5rem);
}

/* ── 우측 칩 (#aside 안에서 사용) — button/a 어느 태그든 클래스만 얹으면 됨.
 *    슬롯으로 들어오는 마크업이라 :slotted() 로 지정한다 (scoped CSS 는 직접 못 닿음).
 *    NChip / NButton 을 쓰는 편이 우선이고, 이 클래스는 m8 헤더 마크업 이식용 escape hatch. ── */
:slotted(.n-detail-header__chip) {
  display: inline-flex;
  align-items: center;
  gap: var(--n-spacing-1, 0.25rem);
  padding: 5px 10px 5px 11px;
  border: var(--n-border-width-1, 1px) solid var(--n-color-neutral-200, #e5e5e5);
  border-radius: var(--n-radius-lg, 0.5rem);
  background: var(--n-color-neutral-50, #fafafa);
  cursor: pointer;
  font-size: var(--n-font-size-xs, 0.75rem);
  color: var(--n-color-neutral-700, #404040);
  text-decoration: none;
  transition:
    border-color var(--n-transition-fast, 150ms ease),
    background var(--n-transition-fast, 150ms ease);
}

:slotted(.n-detail-header__chip:hover) {
  border-color: var(--n-color-primary-500, #6239ff);
  background: var(--n-color-primary-50, #f1edff);
}

:slotted(.n-detail-header__chip) .n-detail-header__chip-label {
  font-size: var(--n-font-size-xs, 0.75rem);
  font-weight: var(--n-font-weight-semibold, 600);
  color: var(--n-color-neutral-500, #737373);
}

:slotted(.n-detail-header__chip) .n-detail-header__chip-strong {
  font-weight: var(--n-font-weight-bold, 700);
  color: var(--n-color-neutral-900, #171717);
}

:slotted(.n-detail-header__chip) .n-detail-header__chip-sub {
  font-size: var(--n-font-size-xs, 0.75rem);
  color: var(--n-color-neutral-500, #737373);
}

:slotted(.n-detail-header__chip) .n-detail-header__chip-arrow {
  color: var(--n-color-primary-600, #5025e8);
  font-weight: var(--n-font-weight-bold, 700);
}

/* ── 메타 라인 ── */
.n-detail-header__meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  /* 가로 간격은 구분자(·)가 margin 으로 갖는다 → 여기선 줄바꿈용 row-gap 만 */
  gap: var(--n-spacing-1, 0.25rem) 0;
  font-size: var(--n-detail-header-meta-font-size, var(--n-font-size-sm, 0.875rem));
  color: var(--n-color-neutral-600, #525252);
}

.n-detail-header__meta-item {
  display: inline-flex;
  align-items: center;
  gap: var(--n-spacing-1, 0.25rem);
}

.n-detail-header__meta-label {
  font-weight: var(--n-font-weight-semibold, 600);
  color: var(--n-detail-header-meta-label-color, var(--n-color-neutral-500, #737373));
}

.n-detail-header__mono {
  font-family: var(--n-font-family-mono, 'JetBrains Mono', 'Fira Code', Consolas, monospace);
  font-size: var(--n-font-size-xs, 0.75rem);
  background: var(--n-color-neutral-100, #f5f5f5);
  border-radius: var(--n-radius-sm, 0.25rem);
  padding: 1px 5px;
  color: var(--n-color-neutral-700, #404040);
}

.n-detail-header__lock {
  font-size: var(--n-font-size-xs, 0.75rem);
  cursor: help;
}

/* 구분자가 항목 사이 간격(meta-gap)을 절반씩 나눠 갖는다 → 점이 정중앙에 온다 */
.n-detail-header__sep {
  margin-inline: calc(var(--n-detail-header-meta-gap, 1.25rem) / 2);
  color: var(--n-color-neutral-300, #d4d4d4);
}

.n-detail-header__kpis {
  margin-top: var(--n-spacing-1, 0.25rem);
}
</style>
