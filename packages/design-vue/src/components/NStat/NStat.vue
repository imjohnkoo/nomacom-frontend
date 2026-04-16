<template>
  <div class="n-stat" :class="[`n-stat--${variant}`]">
    <div v-if="variant === 'icon-accent' && $slots.icon" class="n-stat__icon-accent">
      <slot name="icon" />
    </div>

    <div class="n-stat__content">
      <dt class="n-stat__label">{{ label }}</dt>
      <dd class="n-stat__value">{{ value }}</dd>

      <div v-if="change !== undefined || $slots.footer" class="n-stat__footer">
        <slot name="footer">
          <span v-if="change !== undefined" class="n-stat__change" :class="changeClasses">
            <svg
              v-if="changeDirection === 'up'"
              class="n-stat__change-icon"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z"
                clip-rule="evenodd"
              />
            </svg>
            <svg
              v-else-if="changeDirection === 'down'"
              class="n-stat__change-icon"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z"
                clip-rule="evenodd"
              />
            </svg>
            {{ formattedChange }}
          </span>
          <span v-if="changePeriod && change !== undefined" class="n-stat__period">
            {{ changePeriod }}
          </span>
        </slot>
      </div>
    </div>

    <div v-if="variant === 'minimal' && $slots.icon" class="n-stat__icon-minimal">
      <slot name="icon" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface NStatProps {
  label: string
  value: string | number
  change?: number
  changePeriod?: string
  trend?: 'up-good' | 'up-bad'
  variant?: 'minimal' | 'icon-accent'
}

const props = withDefaults(defineProps<NStatProps>(), {
  change: undefined,
  changePeriod: undefined,
  trend: 'up-good',
  variant: 'minimal',
})

const changeDirection = computed(() => {
  if (props.change === undefined) return null
  if (props.change > 0) return 'up'
  if (props.change < 0) return 'down'
  return null
})

const changeClasses = computed(() => {
  if (props.change === undefined) return []
  const isUp = props.change > 0
  const goodWhenUp = props.trend !== 'up-bad'
  const isPositive = goodWhenUp ? isUp : !isUp
  return isPositive ? 'n-stat__change--positive' : 'n-stat__change--negative'
})

const formattedChange = computed(() => {
  if (props.change === undefined) return ''
  return `${Math.abs(props.change)}%`
})
</script>

<style scoped>
.n-stat {
  display: flex;
  align-items: flex-start;
  padding: var(--spacing-5, 1.25rem) var(--spacing-6, 1.5rem);
  background-color: var(--color-neutral-0, #ffffff);
  border: var(--borderWidth-1, 1px) solid var(--color-neutral-200, #e5e5e5);
  border-radius: var(--radius-xl, 0.75rem);
  font-family: var(--font-fontFamily-sans, sans-serif);
  gap: var(--spacing-4, 1rem);
}

.n-stat__content {
  flex: 1;
  min-width: 0;
}

.n-stat__label {
  font-size: var(--font-fontSize-sm, 0.875rem);
  font-weight: var(--font-fontWeight-medium, 500);
  color: var(--color-neutral-500, #737373);
  margin: 0;
}

.n-stat__value {
  font-size: var(--font-fontSize-2xl, 1.5rem);
  font-weight: var(--font-fontWeight-bold, 700);
  color: var(--color-neutral-900, #171717);
  margin: var(--spacing-1, 0.25rem) 0 0;
  line-height: 1.2;
}

.n-stat__footer {
  display: flex;
  align-items: center;
  gap: var(--spacing-2, 0.5rem);
  margin-top: var(--spacing-2, 0.5rem);
}

.n-stat__change {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: var(--font-fontSize-sm, 0.875rem);
  font-weight: var(--font-fontWeight-medium, 500);
}

.n-stat__change--positive {
  color: var(--color-success-500, #22c55e);
}

.n-stat__change--negative {
  color: var(--color-error-500, #ef4444);
}

.n-stat__change-icon {
  width: 16px;
  height: 16px;
}

.n-stat__period {
  font-size: var(--font-fontSize-xs, 0.75rem);
  color: var(--color-neutral-400, #a3a3a3);
}

.n-stat__icon-accent {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg, 0.5rem);
  background-color: var(--color-primary-50, #f5f3ff);
  color: var(--color-primary-500, #6239FF);
  flex-shrink: 0;
}

.n-stat__icon-minimal {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: var(--color-neutral-400, #a3a3a3);
  flex-shrink: 0;
}
</style>
