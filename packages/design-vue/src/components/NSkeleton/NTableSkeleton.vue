<template>
  <!-- role=status + aria-busy — 스켈레톤은 «시각적 자리표시»라 낭독기에는 아무것도
       전달되지 않는다. 그러면 로딩 중인지 빈 표인지 구분할 수 없다. -->
  <div class="n-table-skeleton" role="status" aria-busy="true" :aria-label="label">
    <div class="n-table-skeleton__header" :style="gridStyle" aria-hidden="true">
      <div
        v-for="col in normalizedColumns"
        :key="`header-${col}`"
        class="n-table-skeleton__header-cell n-skeleton-pulse"
      />
    </div>
    <div class="n-table-skeleton__body" aria-hidden="true">
      <div
        v-for="row in normalizedRows"
        :key="`row-${row}`"
        class="n-table-skeleton__row"
        :style="gridStyle"
      >
        <div
          v-for="col in normalizedColumns"
          :key="`cell-${row}-${col}`"
          class="n-table-skeleton__cell n-skeleton-pulse"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface NTableSkeletonProps {
  rows?: number
  columns?: number
  /** 스크린리더에 읽히는 로딩 상태 문구 */
  label?: string
}

const props = withDefaults(defineProps<NTableSkeletonProps>(), {
  rows: 10,
  columns: 5,
  label: '목록을 불러오는 중',
})

const normalizedRows = computed(() => Math.max(1, props.rows))
const normalizedColumns = computed(() => Math.max(1, props.columns))
const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${normalizedColumns.value}, minmax(0, 1fr))`,
}))
</script>

<style scoped>
.n-table-skeleton__header {
  display: grid;
  gap: var(--n-spacing-3, 0.75rem);
  padding: var(--n-spacing-3, 0.75rem) var(--n-spacing-4, 1rem);
  border-bottom: var(--n-border-width-1, 1px) solid var(--n-color-neutral-200, #e5e5e5);
}

.n-table-skeleton__header-cell {
  height: 14px;
  border-radius: var(--n-radius-sm, 0.25rem);
}

.n-table-skeleton__row {
  display: grid;
  gap: var(--n-spacing-3, 0.75rem);
  padding: var(--n-spacing-3, 0.75rem) var(--n-spacing-4, 1rem);
  border-bottom: var(--n-border-width-1, 1px) solid var(--n-color-neutral-100, #f5f5f5);
}

.n-table-skeleton__row:last-child {
  border-bottom: none;
}

.n-table-skeleton__cell {
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
  animation: n-skeleton-pulse 1.5s ease-in-out infinite;
}

@keyframes n-skeleton-pulse {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
