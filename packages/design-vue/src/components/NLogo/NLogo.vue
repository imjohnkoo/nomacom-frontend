<template>
  <span
    :class="['n-logo', `n-logo--${variant}`]"
    :style="sizeStyle"
    role="img"
    :aria-label="ariaLabel"
    v-html="svgMarkup"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import engFilled from '../../assets/logo/eng-filled.svg?raw'
import korFilled from '../../assets/logo/kor-filled.svg?raw'
import squareFilled from '../../assets/logo/square-filled.svg?raw'

export type NLogoVariant = 'eng' | 'kor' | 'square'
export type NLogoSize = 'sm' | 'md' | 'lg' | 'xl'

export interface NLogoProps {
  variant?: NLogoVariant
  size?: NLogoSize
  width?: number | string
  height?: number | string
  ariaLabel?: string
}

const props = withDefaults(defineProps<NLogoProps>(), {
  variant: 'eng',
  size: 'md',
  width: undefined,
  height: undefined,
  ariaLabel: 'esimmany',
})

const sources: Record<NLogoVariant, string> = {
  eng: engFilled,
  kor: korFilled,
  square: squareFilled,
}

const svgMarkup = computed(() => sources[props.variant])

const widthMap: Record<NLogoVariant, Record<NLogoSize, number>> = {
  eng: { sm: 96, md: 144, lg: 200, xl: 280 },
  kor: { sm: 96, md: 144, lg: 200, xl: 280 },
  square: { sm: 32, md: 48, lg: 64, xl: 96 },
}

const toCssLen = (v: number | string) => (typeof v === 'number' ? `${v}px` : v)

const sizeStyle = computed(() => {
  if (props.width !== undefined || props.height !== undefined) {
    return {
      width: props.width !== undefined ? toCssLen(props.width) : 'auto',
      height: props.height !== undefined ? toCssLen(props.height) : 'auto',
    }
  }
  return { width: `${widthMap[props.variant][props.size]}px`, height: 'auto' }
})
</script>

<style scoped>
.n-logo {
  display: inline-block;
  line-height: 0;
}

.n-logo :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
