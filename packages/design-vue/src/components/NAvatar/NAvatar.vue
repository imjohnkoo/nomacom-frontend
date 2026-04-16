<script setup lang="ts">
import { computed } from 'vue'
import { AvatarRoot, AvatarImage, AvatarFallback } from 'reka-ui'

export interface NAvatarProps {
  src?: string
  alt?: string
  text?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  rounded?: boolean
}

const props = withDefaults(defineProps<NAvatarProps>(), {
  size: 'md',
  rounded: true,
})

const initials = computed(() => {
  if (!props.text) return ''
  const words = props.text.trim().split(/\s+/)
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  return words[0].substring(0, 2).toUpperCase()
})
</script>

<template>
  <AvatarRoot
    :class="[
      'n-avatar',
      `n-avatar--${size}`,
      { 'n-avatar--rounded': rounded },
    ]"
  >
    <AvatarImage
      v-if="src"
      :src="src"
      :alt="alt"
      class="n-avatar__image"
    />
    <AvatarFallback
      class="n-avatar__fallback"
      :delay-ms="src ? 600 : 0"
    >
      <slot name="fallback">
        {{ initials }}
      </slot>
    </AvatarFallback>
  </AvatarRoot>
</template>

<style scoped>
.n-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  vertical-align: middle;
  user-select: none;
  flex-shrink: 0;
  background-color: var(--color-neutral-100);
  border-radius: var(--radius-md);
}

.n-avatar--rounded {
  border-radius: var(--radius-full);
}

.n-avatar--xs {
  width: 24px;
  height: 24px;
  font-size: var(--font-fontSize-xs);
}

.n-avatar--sm {
  width: 32px;
  height: 32px;
  font-size: var(--font-fontSize-xs);
}

.n-avatar--md {
  width: 40px;
  height: 40px;
  font-size: var(--font-fontSize-sm);
}

.n-avatar--lg {
  width: 48px;
  height: 48px;
  font-size: var(--font-fontSize-base);
}

.n-avatar--xl {
  width: 64px;
  height: 64px;
  font-size: var(--font-fontSize-lg);
}

.n-avatar__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: inherit;
}

.n-avatar__fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-family: var(--font-fontFamily-sans);
  font-weight: var(--font-fontWeight-medium);
  color: var(--color-neutral-600);
  background-color: var(--color-neutral-100);
  line-height: 1;
}
</style>
