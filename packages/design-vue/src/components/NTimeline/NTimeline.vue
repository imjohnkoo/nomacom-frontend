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
  font-family: var(--font-fontFamily-sans, sans-serif);
  display: flex;
  flex-direction: column;
  width: 100%;
}

.n-timeline__item {
  display: flex;
  gap: var(--spacing-3, 0.75rem);
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
  border-radius: var(--radius-full, 9999px);
  border: var(--borderWidth-2, 2px) solid;
  background-color: var(--color-neutral-0, #ffffff);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  margin-top: var(--spacing-1, 0.25rem);
}

.n-timeline__dot--primary {
  border-color: var(--color-primary-500, #3b82f6);
  background-color: var(--color-primary-500, #3b82f6);
}

.n-timeline__dot--success {
  border-color: var(--color-success-500, #22c55e);
  background-color: var(--color-success-500, #22c55e);
}

.n-timeline__dot--warning {
  border-color: var(--color-warning-500, #f59e0b);
  background-color: var(--color-warning-500, #f59e0b);
}

.n-timeline__dot--error {
  border-color: var(--color-error-500, #ef4444);
  background-color: var(--color-error-500, #ef4444);
}

.n-timeline__dot--info {
  border-color: var(--color-info-500, #06b6d4);
  background-color: var(--color-info-500, #06b6d4);
}

.n-timeline__dot--neutral {
  border-color: var(--color-neutral-400, #a3a3a3);
  background-color: var(--color-neutral-400, #a3a3a3);
}

.n-timeline__dot-icon {
  font-size: 8px;
  line-height: 1;
  color: var(--color-neutral-0, #ffffff);
}

.n-timeline__line {
  width: 2px;
  flex: 1;
  min-height: var(--spacing-4, 1rem);
}

.n-timeline__line--primary {
  background-color: var(--color-primary-200, #bfdbfe);
}

.n-timeline__line--success {
  background-color: var(--color-success-50, #f0fdf4);
}

.n-timeline__line--warning {
  background-color: var(--color-warning-50, #fffbeb);
}

.n-timeline__line--error {
  background-color: var(--color-error-50, #fef2f2);
}

.n-timeline__line--info {
  background-color: var(--color-info-50, #ecfeff);
}

.n-timeline__line--neutral {
  background-color: var(--color-neutral-200, #e5e5e5);
}

.n-timeline__content {
  flex: 1;
  padding-bottom: var(--spacing-6, 1.5rem);
}

.n-timeline__item:last-child .n-timeline__content {
  padding-bottom: 0;
}

.n-timeline__header {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-2, 0.5rem);
  flex-wrap: wrap;
}

.n-timeline__title {
  margin: 0;
  font-size: var(--font-fontSize-base, 1rem);
  font-weight: var(--font-fontWeight-semibold, 600);
  color: var(--color-neutral-800, #262626);
  line-height: 1.5;
}

.n-timeline__time {
  font-size: var(--font-fontSize-xs, 0.75rem);
  color: var(--color-neutral-400, #a3a3a3);
  white-space: nowrap;
}

.n-timeline__description {
  margin: var(--spacing-1, 0.25rem) 0 0;
  font-size: var(--font-fontSize-sm, 0.875rem);
  color: var(--color-neutral-600, #525252);
  line-height: 1.6;
}
</style>
