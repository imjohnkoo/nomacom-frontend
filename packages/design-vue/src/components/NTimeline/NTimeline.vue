<template>
  <div class="n-timeline" role="list">
    <div
      v-for="(item, index) in items"
      :key="index"
      class="n-timeline__item"
      role="listitem"
    >
      <div class="n-timeline__indicator">
        <div
          :class="[
            'n-timeline__dot',
            `n-timeline__dot--${item.color || 'primary'}`,
          ]"
        >
          <span v-if="item.icon" class="n-timeline__dot-icon">{{ item.icon }}</span>
        </div>
        <div
          v-if="index < items.length - 1"
          :class="[
            'n-timeline__line',
            `n-timeline__line--${item.color || 'primary'}`,
          ]"
        />
      </div>

      <div class="n-timeline__content">
        <div class="n-timeline__header">
          <h4 class="n-timeline__title">{{ item.title }}</h4>
          <span v-if="item.time" class="n-timeline__time">{{ item.time }}</span>
        </div>
        <p v-if="item.description" class="n-timeline__description">
          {{ item.description }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
export type NColor = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral'

export interface NTimelineItem {
  title: string
  description?: string
  icon?: string
  color?: NColor
  time?: string
}

export interface NTimelineProps {
  items?: NTimelineItem[]
}

withDefaults(defineProps<NTimelineProps>(), {
  items: () => [],
})
</script>

<style scoped>
.n-timeline {
  font-family: var(--n-font-family-sans, 'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Segoe UI', 'Noto Sans KR', sans-serif);
  display: flex;
  flex-direction: column;
  width: 100%;
}

.n-timeline__item {
  display: flex;
  gap: var(--n-spacing-3, 0.75rem);
  position: relative;
}

.n-timeline__indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.n-timeline__dot {
  width: 12px;
  height: 12px;
  border-radius: var(--n-radius-full, 9999px);
  border: var(--n-border-width-2, 2px) solid;
  background-color: var(--n-color-neutral-0, #ffffff);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  margin-top: var(--n-spacing-1, 0.25rem);
}

.n-timeline__dot--primary {
  border-color: var(--n-color-primary-500, #6239FF);
  background-color: var(--n-color-primary-500, #6239FF);
}

.n-timeline__dot--success {
  border-color: var(--n-color-success-500, #22c55e);
  background-color: var(--n-color-success-500, #22c55e);
}

.n-timeline__dot--warning {
  border-color: var(--n-color-warning-500, #f59e0b);
  background-color: var(--n-color-warning-500, #f59e0b);
}

.n-timeline__dot--error {
  border-color: var(--n-color-error-500, #ef4444);
  background-color: var(--n-color-error-500, #ef4444);
}

.n-timeline__dot--info {
  border-color: var(--n-color-info-500, #0ea5e9);
  background-color: var(--n-color-info-500, #0ea5e9);
}

.n-timeline__dot--neutral {
  border-color: var(--n-color-neutral-400, #a3a3a3);
  background-color: var(--n-color-neutral-400, #a3a3a3);
}

.n-timeline__dot-icon {
  font-size: 8px;
  line-height: 1;
  color: var(--n-color-neutral-0, #ffffff);
}

.n-timeline__line {
  width: 2px;
  flex: 1;
  min-height: var(--n-spacing-4, 1rem);
}

.n-timeline__line--primary {
  background-color: var(--n-color-primary-200, #c7b6ff);
}

.n-timeline__line--success {
  background-color: var(--n-color-success-50, #f0fdf4);
}

.n-timeline__line--warning {
  background-color: var(--n-color-warning-50, #fffbeb);
}

.n-timeline__line--error {
  background-color: var(--n-color-error-50, #fef2f2);
}

.n-timeline__line--info {
  background-color: var(--n-color-info-50, #f0f9ff);
}

.n-timeline__line--neutral {
  background-color: var(--n-color-neutral-200, #e5e5e5);
}

.n-timeline__content {
  flex: 1;
  padding-bottom: var(--n-spacing-6, 1.5rem);
}

.n-timeline__item:last-child .n-timeline__content {
  padding-bottom: 0;
}

.n-timeline__header {
  display: flex;
  align-items: baseline;
  gap: var(--n-spacing-2, 0.5rem);
  flex-wrap: wrap;
}

.n-timeline__title {
  margin: 0;
  font-size: var(--n-font-size-base, 1rem);
  font-weight: var(--n-font-weight-semibold, 600);
  color: var(--n-color-neutral-800, #262626);
  line-height: 1.5;
}

.n-timeline__time {
  font-size: var(--n-font-size-xs, 0.75rem);
  color: var(--n-color-neutral-400, #a3a3a3);
  white-space: nowrap;
}

.n-timeline__description {
  margin: var(--n-spacing-1, 0.25rem) 0 0;
  font-size: var(--n-font-size-sm, 0.875rem);
  color: var(--n-color-neutral-600, #525252);
  line-height: 1.6;
}
</style>
