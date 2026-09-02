<template>
  <!-- 1. 에러 — 재시도 가능한 인라인 에러 박스 -->
  <div v-if="error" class="n-async-section__error" role="alert">
    <slot name="error" :message="resolvedErrorMessage">
      <p class="n-async-section__error-message">{{ resolvedErrorMessage }}</p>
      <NButton v-if="retryable" variant="danger" size="sm" @click="emit('retry')">
        다시 시도
      </NButton>
    </slot>
  </div>

  <!-- 2. 최초 로드 — 스켈레톤 -->
  <template v-else-if="pending && empty">
    <slot name="skeleton">
      <NTableSkeleton
        v-if="skeleton === 'table'"
        :rows="skeletonRows"
        :columns="skeletonColumns"
      />
      <NDetailSkeleton v-else-if="skeleton === 'detail'" :fields="skeletonFields" />
    </slot>
  </template>

  <!-- 3. 빈 상태 -->
  <template v-else-if="empty">
    <slot name="empty">
      <div class="n-async-section__empty">
        <NEmpty :title="emptyTitle" :description="emptyDescription" />
      </div>
    </slot>
  </template>

  <!-- 4. 콘텐츠 (+ 갱신 오버레이) -->
  <div v-else class="n-async-section__body">
    <slot />
    <div v-if="pending" class="n-async-section__overlay" aria-hidden="true">
      <span class="n-async-section__spinner" />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 비동기 섹션 상태 4종(로딩·에러·빈·콘텐츠)의 표준 래퍼.
 *
 * 페이지마다 손으로 복사되던 트라이어드(스켈레톤 → 오버레이 → 에러박스)를 흡수한다.
 * 핵심 규칙 두 가지:
 *   - 최초 로드 (pending && empty)  → 스켈레톤. 레이아웃을 미리 잡아 CLS 를 막는다.
 *   - 갱신     (pending && !empty) → 오버레이 스피너. 기존 데이터를 지우지 않는다.
 *     필터를 바꿀 때마다 표가 빈 화면으로 깜빡이면 "데이터가 사라졌나"로 오독된다.
 *
 * ⚠️ 조회 실패를 빈 상태로 위장하지 말 것. `error` 를 넘기지 않고 catch 에서 빈 배열을
 *    돌려주면 화면은 "데이터가 없습니다"를 말하는데, 이건 사실 주장이라 운영 판단을 망친다.
 */
import { computed } from 'vue'
import NButton from '../NButton/NButton.vue'
import NEmpty from '../NEmpty/NEmpty.vue'
import NTableSkeleton from '../NSkeleton/NTableSkeleton.vue'
import NDetailSkeleton from '../NSkeleton/NDetailSkeleton.vue'

export interface NAsyncSectionProps {
  /** 요청 진행 중 여부 */
  pending?: boolean
  /** truthy 면 에러 상태로 렌더 (메시지 커스텀은 errorMessage) */
  error?: unknown
  errorMessage?: string
  /** 표시할 데이터가 없음 — pending 과 조합해 스켈레톤/빈 상태를 구분 */
  empty?: boolean
  /** 최초 로드 스켈레톤 종류 */
  skeleton?: 'table' | 'detail' | 'none'
  skeletonRows?: number
  skeletonColumns?: number
  skeletonFields?: number
  emptyTitle?: string
  emptyDescription?: string
  /** 에러 박스에 「다시 시도」 버튼 표시 */
  retryable?: boolean
}

const props = withDefaults(defineProps<NAsyncSectionProps>(), {
  pending: false,
  error: undefined,
  errorMessage: undefined,
  empty: false,
  skeleton: 'table',
  skeletonRows: 10,
  skeletonColumns: 5,
  skeletonFields: 8,
  emptyTitle: '데이터가 없습니다',
  emptyDescription: undefined,
  retryable: true,
})

const emit = defineEmits<{ retry: [] }>()

const resolvedErrorMessage = computed(() => props.errorMessage ?? '데이터를 불러오지 못했습니다.')
</script>

<style scoped>
.n-async-section__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--n-async-section-gap, 0.75rem);
  padding: var(--n-spacing-6, 1.5rem);
  text-align: center;
  border: var(--n-border-width-1, 1px) solid var(--n-color-error-200, #fecaca);
  background: var(--n-async-section-error-bg, var(--n-color-error-50, #fef2f2));
  border-radius: var(--n-radius-lg, 0.5rem);
}

.n-async-section__error-message {
  margin: 0;
  font-family: var(--n-font-family-sans);
  font-size: var(--n-font-size-sm, 0.875rem);
  color: var(--n-async-section-error-color, var(--n-color-error-600, #dc2626));
}

.n-async-section__empty {
  padding: var(--n-spacing-6, 1.5rem);
  border: var(--n-border-width-1, 1px) solid var(--n-color-neutral-200, #e5e5e5);
  background: var(--n-color-neutral-50, #fafafa);
  border-radius: var(--n-radius-lg, 0.5rem);
}

/* min-height 를 두지 않는다 — 콘텐츠가 높이를 정한다.
   오버레이는 이 박스를 기준으로 절대배치되므로 position 만 있으면 된다. */
.n-async-section__body {
  position: relative;
}

/* 데이터가 있는 상태의 재요청 — 콘텐츠 유지 + 반투명 오버레이 */
.n-async-section__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--n-async-section-overlay-bg, rgba(255, 255, 255, 0.6));
  border-radius: inherit;
  pointer-events: none;
  z-index: 1;
}

.n-async-section__spinner {
  width: 1.375rem;
  height: 1.375rem;
  border-radius: var(--n-radius-full, 9999px);
  border: 2.5px solid var(--n-color-neutral-300, #d4d4d4);
  border-top-color: var(--n-color-primary-500, #6239ff);
  animation: n-async-section-spin 0.7s linear infinite;
}

@keyframes n-async-section-spin {
  to {
    transform: rotate(360deg);
  }
}

/* 전역 reduced-motion 가드가 0.01ms 로 낮추면 스피너가 멈춘 것처럼 보인다.
   회전은 «상태 표시»라 완전히 없애면 안 되므로 느리게만 돌린다. */
@media (prefers-reduced-motion: reduce) {
  .n-async-section__spinner {
    animation-duration: 1.6s !important;
  }
}
</style>
