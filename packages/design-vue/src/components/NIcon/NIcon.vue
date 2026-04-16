<template>
  <span
    :class="['n-icon', `n-icon--${size}`, name]"
    role="img"
    :aria-label="name"
  />
</template>

<script setup lang="ts">
import type { NSize } from '../../types/common'

export interface NIconProps {
  name: string
  size?: NSize
}

withDefaults(defineProps<NIconProps>(), {
  size: 'md',
})
</script>

<style scoped>
.n-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  line-height: 1;
}

.n-icon--xs {
  width: 0.75rem;
  height: 0.75rem;
  font-size: 0.75rem;
}

.n-icon--sm {
  width: 1rem;
  height: 1rem;
  font-size: 1rem;
}

.n-icon--md {
  width: 1.25rem;
  height: 1.25rem;
  font-size: 1.25rem;
}

.n-icon--lg {
  width: 1.5rem;
  height: 1.5rem;
  font-size: 1.5rem;
}

.n-icon--xl {
  width: 2rem;
  height: 2rem;
  font-size: 2rem;
}
</style>
