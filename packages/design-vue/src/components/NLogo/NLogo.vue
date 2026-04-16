<template>
  <!-- Full wordmark: N icon + "nomacom" text -->
  <svg
    v-if="variant === 'full'"
    :class="['n-logo', `n-logo--${size}`, theme && `n-logo--${theme}`]"
    :width="svgWidth"
    :height="svgHeight"
    viewBox="0 0 200 36"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    :aria-label="ariaLabel"
  >
    <title>{{ ariaLabel }}</title>
    <path
      class="n-logo__mark"
      d="M6 30V6h5l14 18V6h5v24h-5L11 12v18H6z"
    />
    <text
      class="n-logo__text"
      x="42"
      y="26"
      font-family="system-ui, -apple-system, sans-serif"
      font-size="20"
      font-weight="700"
      letter-spacing="0.5"
    >nomacom</text>
  </svg>

  <!-- Square icon: just the N -->
  <svg
    v-else
    :class="['n-logo', 'n-logo--square', `n-logo--${size}`, theme && `n-logo--${theme}`]"
    :width="svgWidth"
    :height="svgHeight"
    viewBox="0 0 36 36"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    :aria-label="ariaLabel"
  >
    <title>{{ ariaLabel }}</title>
    <path
      class="n-logo__mark"
      d="M6 30V6h5l14 18V6h5v24h-5L11 12v18H6z"
    />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface NLogoProps {
  variant?: 'full' | 'square'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  theme?: 'light' | 'dark'
  width?: number | string
  height?: number | string
  ariaLabel?: string
}

const props = withDefaults(defineProps<NLogoProps>(), {
  variant: 'full',
  size: 'md',
  theme: undefined,
  width: undefined,
  height: undefined,
  ariaLabel: 'nomacom',
})

const fullSizeMap: Record<string, { w: number; h: number }> = {
  sm: { w: 100, h: 18 },
  md: { w: 140, h: 25 },
  lg: { w: 180, h: 32 },
  xl: { w: 240, h: 43 },
}

const squareSizeMap: Record<string, { w: number; h: number }> = {
  sm: { w: 24, h: 24 },
  md: { w: 32, h: 32 },
  lg: { w: 40, h: 40 },
  xl: { w: 56, h: 56 },
}

const sizeMap = computed(() => (props.variant === 'square' ? squareSizeMap : fullSizeMap))

const svgWidth = computed(() => props.width ?? sizeMap.value[props.size].w)
const svgHeight = computed(() => props.height ?? sizeMap.value[props.size].h)
</script>

<style scoped>
.n-logo__mark {
  fill: var(--color-primary-500, #6239FF);
}

.n-logo__text {
  fill: var(--color-neutral-900, #171717);
}

.n-logo--light .n-logo__mark {
  fill: var(--color-primary-300, #c4b5fd);
}

.n-logo--light .n-logo__text {
  fill: var(--color-neutral-0, #ffffff);
}

.n-logo--dark .n-logo__mark {
  fill: var(--color-primary-500, #6239FF);
}

.n-logo--dark .n-logo__text {
  fill: var(--color-neutral-900, #171717);
}
</style>
