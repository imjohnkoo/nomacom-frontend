<script setup lang="ts">
import { computed, useSlots } from 'vue'

export interface NAvatarGroupProps {
  max?: number
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

const props = withDefaults(defineProps<NAvatarGroupProps>(), {
  size: 'md',
})

defineSlots<{
  default(): any
}>()

const slots = useSlots()

const overflowCount = computed(() => {
  if (!props.max || !slots.default) return 0
  const children = slots.default()
  const total = children.length
  return total > props.max ? total - props.max : 0
})

const sizeMap: Record<string, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
}

const overlapOffset = computed(() => {
  const px = sizeMap[props.size] ?? 40
  return `${-(px / 4)}px`
})
</script>

<template>
  <div
    :class="[
      'n-avatar-group',
      `n-avatar-group--${size}`,
    ]"
    :style="{ '--avatar-group-overlap': overlapOffset }"
  >
    <template v-if="$slots.default">
      <div
        v-for="(child, index) in ($slots.default?.() ?? []).slice(0, max)"
        :key="index"
        class="n-avatar-group__item"
      >
        <component :is="child" />
      </div>
    </template>
    <div
      v-if="overflowCount > 0"
      :class="[
        'n-avatar-group__overflow',
        `n-avatar-group__overflow--${size}`,
      ]"
    >
      +{{ overflowCount }}
    </div>
  </div>
</template>

<style scoped>
.n-avatar-group {
  display: flex;
  align-items: center;
}

.n-avatar-group__item {
  position: relative;
  border: 2px solid var(--color-neutral-0);
  border-radius: var(--radius-full);
}

.n-avatar-group__item + .n-avatar-group__item,
.n-avatar-group__overflow {
  margin-left: var(--avatar-group-overlap, -10px);
}

.n-avatar-group__overflow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  background-color: var(--color-neutral-200);
  color: var(--color-neutral-700);
  font-family: var(--font-fontFamily-sans);
  font-weight: var(--font-fontWeight-medium);
  border: 2px solid var(--color-neutral-0);
  flex-shrink: 0;
}

.n-avatar-group__overflow--xs {
  width: 24px;
  height: 24px;
  font-size: var(--font-fontSize-xs);
}

.n-avatar-group__overflow--sm {
  width: 32px;
  height: 32px;
  font-size: var(--font-fontSize-xs);
}

.n-avatar-group__overflow--md {
  width: 40px;
  height: 40px;
  font-size: var(--font-fontSize-sm);
}

.n-avatar-group__overflow--lg {
  width: 48px;
  height: 48px;
  font-size: var(--font-fontSize-base);
}

.n-avatar-group__overflow--xl {
  width: 64px;
  height: 64px;
  font-size: var(--font-fontSize-lg);
}
</style>
