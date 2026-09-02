<template>
  <div
    :class="['n-page-header', { 'n-page-header--with-bg': backgroundImage }]"
    :style="backgroundStyles"
  >
    <div class="n-page-header__overlay" />
    <div class="n-page-header__content">
      <slot name="top">
        <span v-if="step" class="n-page-header__step">{{ step }}</span>
      </slot>
      <h1 v-if="title" class="n-page-header__title">{{ title }}</h1>
      <slot>
        <p v-if="subtitle" class="n-page-header__subtitle">{{ subtitle }}</p>
      </slot>
      <slot name="bottom">
        <div v-if="meta" class="n-page-header__meta">
          <span v-if="metaLabel" class="n-page-header__meta-label">{{ metaLabel }}</span>
          <span class="n-page-header__meta-value">{{ meta }}</span>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface NPageHeaderProps {
  title?: string
  subtitle?: string
  step?: string
  meta?: string
  metaLabel?: string
  backgroundImage?: string
  height?: string
}

const props = withDefaults(defineProps<NPageHeaderProps>(), {
  title: undefined,
  subtitle: undefined,
  step: undefined,
  meta: undefined,
  metaLabel: undefined,
  backgroundImage: undefined,
  height: '16rem',
})

const backgroundStyles = computed(() => {
  const styles: Record<string, string> = { height: props.height }
  if (props.backgroundImage) {
    styles.backgroundImage = `url(${props.backgroundImage})`
  }
  return styles
})
</script>

<style scoped>
.n-page-header {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: var(--n-spacing-4, 1rem) var(--n-spacing-4, 1rem) var(--n-spacing-5, 1.25rem);
  border-radius: 0 0 var(--n-radius-2xl, 1rem) var(--n-radius-2xl, 1rem);
  background-color: var(--n-color-primary-600, #5025e8);
  background-size: cover;
  background-position: center;
  color: var(--n-color-neutral-0, #ffffff);
  font-family: var(--n-font-family-sans, 'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Segoe UI', 'Noto Sans KR', sans-serif);
  overflow: hidden;
}

.n-page-header__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgb(0 0 0 / 0.4), transparent);
  pointer-events: none;
}

.n-page-header--with-bg .n-page-header__overlay {
  display: block;
}

.n-page-header__content {
  position: relative;
  z-index: 1;
}

.n-page-header__step {
  display: inline-block;
  font-size: var(--n-font-size-sm, 0.875rem);
  opacity: 0.85;
  margin-bottom: var(--n-spacing-2, 0.5rem);
}

.n-page-header__title {
  margin: 0;
  font-size: var(--n-font-size-2xl, 1.5rem);
  font-weight: var(--n-font-weight-semibold, 600);
  line-height: 1.3;
  margin-bottom: var(--n-spacing-2, 0.5rem);
}

.n-page-header__subtitle {
  margin: 0;
  font-size: var(--n-font-size-sm, 0.875rem);
  opacity: 0.85;
  line-height: 1.5;
}

.n-page-header__meta {
  display: flex;
  flex-direction: column;
  gap: var(--n-spacing-1, 0.25rem);
  margin-top: var(--n-spacing-2, 0.5rem);
}

.n-page-header__meta-label {
  font-size: var(--n-font-size-xs, 0.75rem);
  opacity: 0.7;
}

.n-page-header__meta-value {
  font-size: var(--n-font-size-xs, 0.75rem);
  font-weight: var(--n-font-weight-medium, 500);
}
</style>
