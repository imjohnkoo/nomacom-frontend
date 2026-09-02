<template>
  <!-- role=status + aria-busy — NTableSkeleton 과 동일한 이유 -->
  <div class="n-detail-skeleton" role="status" aria-busy="true" :aria-label="label">
    <div class="n-detail-skeleton__grid" aria-hidden="true">
      <div v-for="n in normalizedFields" :key="`field-${n}`" class="n-detail-skeleton__field">
        <div class="n-detail-skeleton__label n-skeleton-pulse" />
        <div class="n-detail-skeleton__value n-skeleton-pulse" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface NDetailSkeletonProps {
  fields?: number
  /** 스크린리더에 읽히는 로딩 상태 문구 */
  label?: string
}

const props = withDefaults(defineProps<NDetailSkeletonProps>(), {
  fields: 8,
  label: '상세 정보를 불러오는 중',
})

const normalizedFields = computed(() => Math.max(1, props.fields))
</script>

<style scoped>
.n-detail-skeleton__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
  gap: var(--n-spacing-4, 1rem) var(--n-spacing-6, 1.5rem);
  padding: var(--n-spacing-4, 1rem);
}

.n-detail-skeleton__field {
  display: flex;
  flex-direction: column;
  gap: var(--n-spacing-2, 0.5rem);
}

.n-detail-skeleton__label {
  width: 30%;
  height: 12px;
  border-radius: var(--n-radius-sm, 0.25rem);
}

.n-detail-skeleton__value {
  width: 70%;
  height: 16px;
  border-radius: var(--n-radius-sm, 0.25rem);
}

.n-skeleton-pulse {
  background: linear-gradient(
    90deg,
    var(--n-color-neutral-100, #f5f5f5) 25%,
    var(--n-color-neutral-200, #e5e5e5) 50%,
    var(--n-color-neutral-100, #f5f5f5) 75%
  );
  background-size: 200% 100%;
  animation: n-detail-skeleton-pulse 1.5s ease-in-out infinite;
}

@keyframes n-detail-skeleton-pulse {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
